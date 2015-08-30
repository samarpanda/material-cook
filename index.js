import Rx, {Observable} from 'rx';
import moment from 'moment';
import _ from 'lodash';
import path from 'path';
import {readFile, writeFile, existsSync, mkdirSync} from 'fs';
import {copy, ensureDir, removeSync} from 'fs-extra';

const readFile_ = Observable.fromNodeCallback(readFile);
const writeFile_ = Observable.fromNodeCallback(writeFile);
const postTemplate = path.resolve(__dirname, 'assert/templates/post.html');
const testsTemplate = path.resolve(__dirname, 'assert/templates/exercise.html');

const toastDir = path.resolve('./toast');

Rx.config.longStackSupport = true;

const setupToastDir_ = () => {
  let copyDist_ = Observable.fromNodeCallback(copy)(path.resolve(__dirname, 'assert/dist'), path.resolve(toastDir, 'dist'), {clobber: true});

  if (existsSync(toastDir)) {
    removeSync(toastDir);
  }
  if (!existsSync(toastDir)) {
    mkdirSync(toastDir);
  }

  return Observable.concat(
    copyDist_
  );
};

const cook = function materialCook(slices_) {
  let content_ = slices_.share();

  //metadata about the post. i.e annotations at the top of the first file
  let postMeta_ = content_.take(1).pluck('meta');

  //ignore those sections which don't have a @type annotation
  content_ = content_
    .filter(c => c.meta && typeof c.meta.type !== 'undefined');

  let html_ = content_
        //read appropriate template file depending on @type of the section
        .flatMap(content => {
          let templatePath = content.meta.type === 'tests' ? testsTemplate : postTemplate;
          return readFile_(templatePath, 'utf-8');
        }, (content, rawTemplate) => ({content, rawTemplate}) )
        //take the content of latest section, template string read from template file and post metadata,
        .combineLatest(
          postMeta_,
          ({content, rawTemplate}, postMeta) => {
            return {
              //build the context to be passed to template for rendering HTML and the template itself in a
              //singleton
              context: {
                title: content.meta.section,
                subtitle: postMeta.subtitle || '',
                authorName: postMeta.author || '',
                publishedOn: moment().format('dddd D MMMM, YYYY'),
                post: content.comments,
                code: Array.isArray(content.code) ? content.code.join('\n') : content.code,
                type: content.meta.type,
              },
              rawTemplate,
            };
          }
        )
        //render the context and template to produce html, keep title and type (used for naming the resulting
        //files later)
        .map(rawPost => ({
          title: rawPost.context.title,
          html: _.template(rawPost.rawTemplate)(rawPost.context),
          type: rawPost.context.type
        }));

  let htmlWrites_ = html_
        .map(({html, title, type}) => ({
          filepath: path.resolve(toastDir, type === 'content' ? `${title}.html` : `${title}-exercise.html`),
          filecontent: html,
        }))
        .flatMap(({filepath, filecontent}) => {
          return writeFile_(filepath, filecontent, 'utf-8');
        });

  setupToastDir_(toastDir)
    .combineLatest(
      htmlWrites_,
      () => {return false;}
    )
    .doOnCompleted(() => console.log('Done! Toast is ready in ./toast'))
    .subscribe();
};

export default {
  name: 'material',
  description: 'Material designed interactive blog posts for your content',
  cook: cook,
};

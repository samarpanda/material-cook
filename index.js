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

  let postMeta_ = content_.take(1).pluck('meta');

  content_ = content_
    .filter(c => c.meta && typeof c.meta.type !== 'undefined')
    .map(content => ({
      content: content.comments,
      meta: content.meta,
      code: content.code
    }));

  let html_ =   content_
        .flatMap(content => {
          let templatePath = content.meta.type === 'tests' ? testsTemplate : postTemplate;
          return readFile_(templatePath, 'utf-8');
        }, (content, rawTemplate) => ({content, rawTemplate}) )
        .combineLatest(
          postMeta_,
          ({content, rawTemplate}, postMeta) => {
            return {
              context: {
                title: content.meta.section,
                subtitle: postMeta.subtitle || '',
                authorName: postMeta.author || '',
                publishedOn: moment().format('dddd D MMMM, YYYY'),
                post: content.content,
                code: content.code,
                type: content.meta.type,
              },
              rawTemplate,
            };
          }
        ).map(rawPost => ({
          title: rawPost.context.title,
          html: _.template(rawPost.rawTemplate)(rawPost.context),
          type: rawPost.context.type
        }))

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

import Rx, {Observable} from 'rx';
import moment from 'moment';
import _ from 'lodash';
import path from 'path';
import {readFile, writeFile, existsSync, mkdirSync} from 'fs';
import {copy, ensureDir, removeSync} from 'fs-extra';

const readFile_ = Observable.fromNodeCallback(readFile);
const writeFile_ = Observable.fromNodeCallback(writeFile);
const postTemplate = path.resolve(__dirname, 'assert/templates/post.html');

const toastDir = path.resolve('./toast');

Rx.config.longStackSupport = false;

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

const cook = function materialCook(content_) {
  content_ = content_.share();

  let postContent_ = content_
        .filter(content => content.meta.type === 'content')
        .map(content => ({
          content: content.comments,
          code: content.code,
          meta: content.meta,
        }));

  let testsContent_ = content_
        .filter(content => content.meta.type === 'tests')
        .map(content => ({
          meta: content.meta
        }));

  let postMeta_ = content_.take(1).pluck('meta');

  let postHtml_ = Observable
        .combineLatest(
          postContent_,
          postMeta_,
          readFile_(postTemplate),
          (content, postMeta, rawTemplate) => ({
            context: {
              title: content.meta.section,
              subtitle: postMeta.subtitle || '',
              authorName: postMeta.author || '',
              publishedOn: moment().format('dddd D MMMM, YYYY'),
              post: content.content,
              code: content.code,
            },
            rawTemplate,
          })
        )
        .map(rawPost => ({
          title: rawPost.context.title,
          html: _.template(rawPost.rawTemplate)(rawPost.context),
        }));

  let generatedPostsWrites_ = postHtml_
        .map(({html, title}) => ({
          filepath: path.resolve(toastDir, `${title}.html`),
          filecontent: html,
        }))
        .combineLatest(
          setupToastDir_(toastDir),
          (fileData) => fileData
        )
        .flatMap(({filepath, filecontent}) => {
          return writeFile_(filepath, filecontent, 'utf-8');
        });

  generatedPostsWrites_
    .subscribe({
      onNext: x => console.log(),
      onCompleted: () => console.log('Done! Cook is ready')
    });
};

export default {
  name: 'material',
  description: 'Material designed interactive blog posts for your content',
  cook: cook,
};

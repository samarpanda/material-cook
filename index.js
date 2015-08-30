import {Observable} from 'rx';

const cook = function materialCook(content_) {
  content_ = content_.share();

  let postContent_ = content_
        .filter(content => content.meta.type === 'content')
        .map(content => ({
          content: content.comments,
          code: content.code,
        }));

  let testsContent_ = content_
        .filter(content => content.meta.type === 'tests');

  let postMeta_ = content_.take(1).pluck('meta');

  Observable.merge(
    testsContent_,
    postContent_
  ).combineLatest(
    postMeta_,
    (content, postMeta) => ({
      title: postMeta.title,
      publishedOn: new Date(),
      post: content.content,
      code: content.code,
    })
  )
    .subscribe(
      content => console.log(content),
      error => console.error(error),
      () => console.log('Done! Cook is ready')
    );
};

export default {
  name: 'material',
  description: 'Material designed interactive blog posts for your content',
  cook: cook,
};

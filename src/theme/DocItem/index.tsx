// import React from 'react';
// import {HtmlClassNameProvider} from '@docusaurus/theme-common';
// import {DocProvider} from '@docusaurus/plugin-content-docs/client';
// import DocItemMetadata from '@theme/DocItem/Metadata';
// import DocItemLayout from '@theme/DocItem/Layout';
// import type {Props} from '@theme/DocItem';

// export default function DocItem(props: Props): JSX.Element {
//   const docHtmlClassName = `docs-doc-id-${props.content.metadata.id}`;
//   const MDXComponent = props.content;
//   return (
//     <DocProvider content={props.content}>
//       <HtmlClassNameProvider className={docHtmlClassName}>
//         <DocItemMetadata />
//         <DocItemLayout>
//           <MDXComponent />
//         </DocItemLayout>
//       </HtmlClassNameProvider>
//     </DocProvider>
//   );
// }

import React, { useEffect } from 'react';
import { HtmlClassNameProvider } from '@docusaurus/theme-common';
import { DocProvider } from '@docusaurus/plugin-content-docs/client';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemLayout from '@theme/DocItem/Layout';
import type { Props } from '@theme/DocItem';

export default function DocItem(props: Props): JSX.Element {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.id}`;
  const MDXComponent = props.content;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'username/repo-name'); // 자신의 GitHub 레포지토리로 변경
    script.setAttribute('issue-term', 'pathname'); // 댓글을 달고자 하는 기준
    script.setAttribute('label', 'comment'); // GitHub 이슈에 적용할 라벨 (옵션)
    script.setAttribute('theme', 'github-light'); // 테마
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    const commentsContainer = document.getElementById('utterances');
    if (commentsContainer) {
      commentsContainer.appendChild(script);
    }
  }, []);

  return (
    <DocProvider content={props.content}>
      <HtmlClassNameProvider className={docHtmlClassName}>
        <DocItemMetadata />
        <DocItemLayout>
          <MDXComponent />
          <div id="utterances" /> {/* Utterances 댓글이 렌더링될 위치 */}
        </DocItemLayout>
      </HtmlClassNameProvider>
    </DocProvider>
  );
}

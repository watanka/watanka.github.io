import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import Comment from "../components/Comment";
import Adsense from '../components/AdSense';
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useLocation } from '@docusaurus/router';

export default function BlogPostItemWrapper(props) {
  const location = useLocation();

  return (
    <>
      <BlogPostItem {...props} />
      <BrowserOnly>
        {() => <Adsense key={location.pathname} />}
      </BrowserOnly>
      <Comment />
    </>
  );
}


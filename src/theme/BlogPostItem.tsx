import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import Comment from "../components/Comment";
import Adsense from '@site/src/components/Adsense';

export default function BlogPostItemWrapper(props) {
  return (
    <>
      <BlogPostItem {...props} />
      <Adsense />
      <Comment />
    </>
  );
}


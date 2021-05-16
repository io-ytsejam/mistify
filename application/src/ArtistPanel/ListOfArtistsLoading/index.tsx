import ContentLoader from "react-content-loader";
import React from "react";

interface ListOfArtistsLoadingProps {
  count: number
}

export default function ListOfArtistsLoading ({ count }: ListOfArtistsLoadingProps) {
  return <>
    {Array(count).fill(1, 0, count).map(() => (<ContentLoader
      speed={2}
      width={378}
      height={112}
      viewBox="0 0 378 112"
      backgroundColor="#f3f3f31f"
      foregroundColor="#ecebeb"
    >
      <rect x="0" y="16" rx="3" ry="3" width="144" height="80"/>
      <rect x="160" y="70" rx="3" ry="3" width="52" height="6"/>
      <rect x="160" y="90" rx="3" ry="3" width="100" height="6"/>
      <rect x="160" y="16" rx="3" ry="3" width="141" height="16"/>
      <rect x="160" y="40" rx="3" ry="3" width="141" height="16"/>
    </ContentLoader>))}</>
}
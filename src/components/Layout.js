import React from "react";
import ProductTable from "./ProductTable";
import styled from "styled-components";

const LayoutWrapper = styled.div`
  // background-color: #dadbf1;
`;
const HeaderWrapper = styled.header`
  margin: 0;
  padding: 2em 2em;
  background-color: #1a222d;
  color: white;
`;
const FooterWrapper = styled.footer`
  margin: 0;
  padding: 2em 2em;
  background-color: #1a222d;
  color: white;
  a {
    color: white;
  }
`;
export default function Layout() {
  return (
    <LayoutWrapper>
      <HeaderWrapper>
        <h1>Delta exchange Assignment</h1>
      </HeaderWrapper>
      <ProductTable />
      <FooterWrapper>
        {"Github "}
        <a href="https://github.com/aryankhera">{"@aryankhera"}</a>
      </FooterWrapper>
    </LayoutWrapper>
  );
}

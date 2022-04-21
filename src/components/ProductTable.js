import React, { useEffect, useState } from "react";
import { PRODUCTS_API, MARK_PRICE_WS } from "../config";
import { Table } from "react-fluid-table";
import styled from "styled-components";

const controller = new AbortController();
const { signal } = controller;

const TableWrapper = styled.div`
  max-width: 95vw;
  display: flex;
  flex-direction: cloumn;
  justify-content: center;
  margin: 2em auto;
`;

export default function ProductTable() {
  const columns = [
    {
      key: "symbol",
      header: "Symbol",
      width: 200,
    },
    {
      key: "description",
      header: "Description",
      width: 600,
    },
    {
      key: "underlying_assets",
      header: "Underlying Assets",
      width: 200,
    },
    {
      key: "mark_price",
      header: "Mark Price",
      width: 200,
    },
  ];

  const headerStyles = {
    backgroundColor: "white",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: "1px 1px 1px 1px",
  };
  const tableStyles = {
    boxShadow: "0 9px 14px 0 rgba(0, 0, 0, 0.3)",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: "0px 1px 1px 1px",
    overflow: "hidden",
    textAlign: "left",
  };
  const [productData, setproductData] = useState([]);
  const [markPrice, setmarkPrice] = useState({});

  useEffect(() => {
    console.log("Socket");
    const socket = new WebSocket(MARK_PRICE_WS);
    if (productData.length > 0) {
      const symbols = [
        ...new Set(productData.map((product) => product["symbol"] || "")),
      ];

      socket.onopen = (event) => {
        socket.send(
          JSON.stringify({
            type: "subscribe",
            payload: {
              channels: [
                {
                  name: "v2/ticker",
                  symbols: symbols,
                },
              ],
            },
          })
        );
      };
      socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if ("symbol" in data && "mark_price" in data)
          setmarkPrice((prevmarkPrice) => {
            let price = {};
            price[data["symbol"]] = parseFloat(data["mark_price"]);
            return { ...prevmarkPrice, ...price };
          });
      };
      socket.onerror = (event) => {
        console.error(event);
      };
      socket.onclose = (event) => console.log("Closed", event);
    }
    return () => {
      socket.close();
    };
  }, [productData]);

  useEffect(() => {
    fetch(PRODUCTS_API, { signal })
      .then((resp) => resp.json())
      .then((data) => {
        let products = data["result"] || [];
        setproductData(
          products.map((product) => {
            return {
              symbol: product["symbol"] || "",
              description: product["description"] || "",
              underlying_assets: product?.underlying_asset?.symbol || "",
            };
          })
        );
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <TableWrapper>
      <Table
        headerStyle={headerStyles}
        tableHeight={800}
        tableStyle={tableStyles}
        data={productData.map((product) => {
          return {
            ...product,
            ...{ mark_price: markPrice[product["symbol"]] || "Loading...." },
          };
        })}
        columns={columns}
      />
    </TableWrapper>
  );
}

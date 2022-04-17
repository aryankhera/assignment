import React, { useEffect, useState } from "react";
import { PRODUCTS_API, MARK_PRICE_WS } from "../config";
const controller = new AbortController();
const { signal } = controller;

export default function Table() {
  const tableHeadings = [
    "Symbol",
    "Description",
    "Underlying Assets",
    "Mark Price",
  ];

  const [loading, setloading] = useState(true);
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
        // console.log(JSON.parse(event.data));
        let data = JSON.parse(event.data);
        if ("symbol" in data && "mark_price" in data)
          setmarkPrice((prevmarkPrice) => {
            let price = {};
            price[data["symbol"]] = data["mark_price"];
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
    console.log("Mounted");
    setloading(true);
    fetch(PRODUCTS_API, { signal })
      .then((resp) => resp.json())
      .then((data) => {
        let products = data["result"] || [];
        console.log(data);
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
        setloading(false);
      });
    setloading(false);
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div>
      {loading ? (
        <div className="loader">
          <p>Loading...</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {tableHeadings.map((heading, index) => (
                <th key={index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productData.map((product, index) => {
              return (
                <tr key={index}>
                  <td>{product["symbol"] || ""}</td>
                  <td>{product["description"] || ""}</td>
                  <td>{product["underlying_assets"] || ""}</td>
                  <td>{markPrice[product["symbol"]] || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

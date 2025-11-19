import React from "react";
import BarcodeScanner from "../components/BarcodeScanner";

const Scanner = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Barcode Scanner</h2>
      <BarcodeScanner />
    </div>
  );
};

export default Scanner;

"use client";

import { useState } from "react";
import { checkout, type Product } from "@/data/content";
import { usePlatform, type Platform } from "@/lib/platform";
import { useMember } from "@/lib/member";
import { IconCheck } from "./icons";
import { Sheet } from "./Sheet";

type PayMethod = { value: string; label: string; sub: string; cta: string; walletPay?: boolean };

const QRIS: PayMethod = { value: "qris", label: "QRIS", sub: "Any e-wallet", cta: "Continue to QRIS" };
const VA: PayMethod = { value: "va", label: "Virtual account", sub: "BCA, Mandiri, BNI", cta: "Continue to bank transfer" };
const CARD: PayMethod = { value: "card", label: "Credit / debit card", sub: "Visa, Mastercard, JCB", cta: "Continue to card payment" };

/* Native wallet first on iOS/Android; on the web it is the last option. */
const PAY_METHODS: Record<Platform, PayMethod[]> = {
  ios: [{ value: "applepay", label: "Apple Pay", sub: "Confirm with Face ID", cta: "Pay with Apple Pay", walletPay: true }, QRIS, VA, CARD],
  android: [{ value: "googlepay", label: "Google Pay", sub: "Fastest", cta: "Pay with Google Pay", walletPay: true }, QRIS, VA, CARD],
  pwa: [QRIS, VA, CARD, { value: "wallet", label: "Apple Pay / Google Pay", sub: "Where supported", cta: "Pay now", walletPay: true }],
};

type CheckoutProps = { open: boolean; onClose: () => void; product: Product; size: string };

export function CheckoutSheet({ open, onClose, product, size }: CheckoutProps) {
  const platform = usePlatform();
  const member = useMember();
  const methods = PAY_METHODS[platform];
  const [picked, setPicked] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const method = methods.find((m) => m.value === picked) ?? methods[0];

  const close = () => {
    onClose();
    setOrderNo(null);
  };

  const pay = () => {
    // INTEGRATION: start payment here (Apple Pay / Google Pay via your PSP,
    // or redirect to Midtrans / Xendit for QRIS, VA and cards).
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setOrderNo("RVC-" + String(Date.now()).slice(-6));
    }, 700);
  };

  return (
    <Sheet open={open} onClose={close} title="Checkout">
      {orderNo === null ? (
        <div>
          <div className="summary-item">
            <div className="summary-item__img">
              <img src={product.img} alt="" width={72} height={90} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
              <strong>{product.name}</strong>
              <span className="dim" style={{ fontSize: 14 }}>
                Size {size} · Qty 1
              </span>
              <span className="tag tag--raw">Drop 01 · limited</span>
            </div>
          </div>
          <div className="line">
            <span>Subtotal</span>
            <span>{product.price}</span>
          </div>
          <div className="line">
            <span>Shipping</span>
            <span>{checkout.shipping}</span>
          </div>
          {member && (
            <div className="line">
              <span>RAW member discount</span>
              <span className="accent">{checkout.memberDiscount}</span>
            </div>
          )}
          <div className="line line--total">
            <span>Total</span>
            <span>{product.price}</span>
          </div>
          <fieldset className="pay-methods">
            <legend className="eyebrow" style={{ padding: "12px 0 4px" }}>
              Pay with
            </legend>
            {methods.map((m) => (
              <label key={m.value} className="pay-method">
                <input
                  type="radio"
                  name="pay"
                  value={m.value}
                  checked={m.value === method.value}
                  onChange={() => setPicked(m.value)}
                />
                <span className="pay-method__label">{m.label}</span>
                <span className="pay-method__sub">{m.sub}</span>
              </label>
            ))}
          </fieldset>
          <div className="sheet__actions">
            <button
              type="button"
              className={method.walletPay ? "btn btn--block btn--pay" : "btn btn--block btn--primary"}
              disabled={paying}
              onClick={pay}
            >
              {method.cta}
            </button>
            <p className="note">Secure payment · Prices in IDR incl. tax</p>
          </div>
        </div>
      ) : (
        <div className="success" role="status">
          <div className="success__icon">
            <IconCheck size={30} />
          </div>
          <h2>Order placed</h2>
          <p>We&apos;ll send updates when it ships. Order no. {orderNo}.</p>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}

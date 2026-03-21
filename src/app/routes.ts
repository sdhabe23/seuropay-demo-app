import { createHashRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./components/Home";
import { NotFound } from "./components/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PaymentDisplay } from "./components/PaymentDisplay";
import { ScanQR } from "./components/ScanQR";
import { Profile } from "./components/Profile";
import { WalletMode } from "./components/WalletMode";
import { AddMoney } from "./components/AddMoney";
import { LinkBank } from "./components/LinkBank";
import { SmartIdAuth } from "./components/SmartIdAuth";
import { MoneyAdded } from "./components/MoneyAdded";
import { RequestAmount } from "./components/RequestAmount";
import { RequestPayment } from "./components/RequestPayment";
import { History } from "./components/History";
import { Receive } from "./components/Receive";
import { PaymentMethod } from "./components/PaymentMethod";
import { PaymentContact } from "./components/PaymentContact";
import { PaymentConfirm } from "./components/PaymentConfirm";
import { SelectRecipient } from "./components/SelectRecipient";
import { FaceIDAuth } from "./components/FaceIDAuth";
import { NFCPayment } from "./components/NFCPayment";
import { PaymentSuccess } from "./components/PaymentSuccess";
import { MoneyReceivedSuccess } from "./components/MoneyReceivedSuccess";
import { ReceiveAmount } from "./components/ReceiveAmount";

export const router = createHashRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "payment",
        Component: PaymentDisplay,
      },
      {
        path: "scan",
        Component: ScanQR,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "wallet-mode",
        Component: WalletMode,
      },
      {
        path: "add-money",
        Component: AddMoney,
      },
      {
        path: "link-bank",
        Component: LinkBank,
      },
      {
        path: "smart-id-auth",
        Component: SmartIdAuth,
      },
      {
        path: "money-added",
        Component: MoneyAdded,
      },
      {
        path: "request",
        Component: RequestAmount,
      },
      {
        path: "request-payment",
        Component: RequestPayment,
      },
      {
        path: "history",
        Component: History,
      },
      {
        path: "receive",
        Component: Receive,
      },
      {
        path: "receive-amount",
        Component: ReceiveAmount,
      },
      {
        path: "payment-method",
        Component: PaymentMethod,
      },
      {
        path: "payment-contact",
        Component: PaymentContact,
      },
      {
        path: "select-recipient",
        Component: SelectRecipient,
      },
      {
        path: "payment-confirm",
        Component: PaymentConfirm,
      },
      {
        path: "face-id-auth",
        Component: FaceIDAuth,
      },
      {
        path: "nfc-payment",
        Component: NFCPayment,
      },
      {
        path: "payment-success",
        Component: PaymentSuccess,
      },
      {
        path: "money-received",
        Component: MoneyReceivedSuccess,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);

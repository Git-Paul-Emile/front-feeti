import { getBackendProviderMode } from "./mode";
import { ExpressAuthProvider } from "./providers/expressAuthProvider";
import { ExpressCatalogEventsProvider } from "./providers/expressCatalogEventsProvider";
import { ExpressEventsProvider } from "./providers/expressEventsProvider";
import { ExpressPaymentsProvider } from "./providers/expressPaymentsProvider";
import { ExpressTicketsProvider } from "./providers/expressTicketsProvider";
import { FirebaseAuthProvider } from "./providers/firebaseAuthProvider";
import { FirebaseCatalogEventsProvider } from "./providers/firebaseCatalogEventsProvider";
import { FirebaseEventsProvider } from "./providers/firebaseEventsProvider";
import { FirebasePaymentsProvider } from "./providers/firebasePaymentsProvider";
import { FirebaseTicketsProvider } from "./providers/firebaseTicketsProvider";
import type { BackendGateway } from "./types";

function buildGateway(): BackendGateway {
  const mode = getBackendProviderMode();

  if (mode === "firebase") {
    return {
      mode,
      auth: new FirebaseAuthProvider(),
      events: new FirebaseEventsProvider(),
      catalogEvents: new FirebaseCatalogEventsProvider(),
      payments: new FirebasePaymentsProvider(),
      tickets: new FirebaseTicketsProvider(),
    };
  }

  return {
    mode,
    auth: new ExpressAuthProvider(),
    events: new ExpressEventsProvider(),
    catalogEvents: new ExpressCatalogEventsProvider(),
    payments: new ExpressPaymentsProvider(),
    tickets: new ExpressTicketsProvider(),
  };
}

export const backendGateway = buildGateway();

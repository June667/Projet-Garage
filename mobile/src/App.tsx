import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { carSport, warning, card, list, carOutline } from "ionicons/icons";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddCar from "./pages/AddCar";
import AddIssue from "./pages/AddIssue";
import Payment from "./pages/Payment";
import MyIssues from "./pages/MyIssues";
import MyCars from "./pages/MyCars";
import { useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import NotificationListener from "./components/NotificationListener";


/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();




const App: React.FC = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const permission = await LocalNotifications.checkPermissions();
        if (permission.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (error) {
        console.error("Error requesting notification permissions", error);
      }
    };
    requestPermissions();
  }, []);

  return (
    <IonApp>
      <NotificationListener />
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/register">
            <Register />
          </Route>
          <Route path="/tabs">
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/tabs/add-car">
                  <AddCar />
                </Route>
                <Route exact path="/tabs/add-issue">
                  <AddIssue />
                </Route>
                <Route exact path="/tabs/payment">
                  <Payment />
                </Route>
                <Route exact path="/tabs/my-issues">
                  <MyIssues />
                </Route>
                <Route exact path="/tabs/my-cars">
                  <MyCars />
                </Route>
                <Route exact path="/tabs">
                  <Redirect to="/tabs/my-cars" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                
                <IonTabButton tab="my-cars" href="/tabs/my-cars">
                  <IonIcon aria-hidden="true" icon={carOutline} />
                  <IonLabel>Voitures</IonLabel>
                </IonTabButton>

                <IonTabButton tab="add-car" href="/tabs/add-car">
                  <IonIcon aria-hidden="true" icon={carSport} />
                  <IonLabel>Ajouter</IonLabel>
                </IonTabButton>

                <IonTabButton tab="add-issue" href="/tabs/add-issue">
                  <IonIcon aria-hidden="true" icon={warning} />
                  <IonLabel>Signaler</IonLabel>
                </IonTabButton>

                <IonTabButton tab="my-issues" href="/tabs/my-issues">
                  <IonIcon aria-hidden="true" icon={list} />
                  <IonLabel>Historique</IonLabel>
                </IonTabButton>

                <IonTabButton tab="payment" href="/tabs/payment">
                  <IonIcon aria-hidden="true" icon={card} />
                  <IonLabel>Paiement</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

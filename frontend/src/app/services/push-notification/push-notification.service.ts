import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  public permission: Permission;
  private dashboardPropertySource = new BehaviorSubject<number>(0);
  dashboardProperty$ = this.dashboardPropertySource.asObservable();

  changeDashboardProperty(newValue: number) {
    this.dashboardPropertySource.next(newValue);
  }

  constructor() {
    this.permission = this.isSupported() ? "default" : "denied";
  }

  public isSupported(): boolean {
    return "Notification" in window;
  }
  requestPermission(): void {
    let self = this;
    if ("Notification" in window) {
      Notification.requestPermission(function(status) {
        return (self.permission = status);
      });
    }
  }

  create(title: string, options?: PushNotification): any {
    let self = this;
    return new Observable(function(obs) {
      if (!("Notification" in window)) {
        console.log("Notifications are not available in this environment");
        obs.complete();
      }

      if (self.permission !== "granted") {
        console.log(
          "The user hasn't granted you permission to send push notifications"
        );
        obs.complete();
      }

      let _notify = new Notification(title, options);
      _notify.onshow = function(e) {
        // setTimeout(function() {
        //   _notify.close();
        // }, 7500);  //7500 default
        return obs.next({
          notification: _notify,
          event: e
        });
      };

      _notify.onclick = function(e) {
        _notify.close();
        return obs.next({
          notification: _notify,
          event: e
        });
      };

      _notify.onerror = function(e) {
        return obs.error({
          notification: _notify,
          event: e
        });
      };

      _notify.onclose = function() {
        return obs.complete();
      };
    });
  }

  generateNotification(source: Array<any>): void {
    if (this.permission == "granted") {
      source.forEach((item, i) => {
        let options = {
          badge: "https://img.icons8.com/plasticine/2x/google-logo.png",
          body: item.alertContent,
         
        };
        setTimeout(() => {
          let ref = this.create(item.title, options).subscribe(res => {
            // console.log("res", res);
          });
          // console.log("ref", ref);
        }, i * 10000);
      });
    }
  }
}

export declare type Permission = "denied" | "granted" | "default";

export interface PushNotification {
  body?: string;
  icon?: string;
  tag?: string;
  data?: any;
  renotify?: boolean;
  silent?: boolean;
  sound?: string;
  noscreen?: boolean;
  sticky?: boolean;
  dir?: "auto" | "ltr" | "rtl";
  lang?: string;
  vibrate?: number[];
}

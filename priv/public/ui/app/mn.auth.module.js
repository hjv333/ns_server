import { NgModule } from '../web_modules/@angular/core.js';
import { MnAuthComponent } from './mn.auth.component.js';
import { MnAuthService } from './mn.auth.service.js';
import { CommonModule } from '/ui/web_modules/@angular/common.js';
import { UIRouterUpgradeModule } from "/ui/web_modules/@uirouter/angular-hybrid.js";
import { ReactiveFormsModule, Validators } from '../web_modules/@angular/forms.js';
import { Location } from '../web_modules/@angular/common.js';
import { MnSharedModule } from './mn.shared.module.js';

let authState = {
  name: "app.auth",
  component: MnAuthComponent
}

export { MnAuthModule };

class MnAuthModule {
  static get annotations() { return [
    new NgModule({
      declarations: [
        MnAuthComponent
      ],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MnSharedModule,
        UIRouterUpgradeModule.forChild({ states: [authState] })
      ],
      entryComponents: [
        MnAuthComponent
      ],
      providers: [
        MnAuthService,
        Validators,
        Location
      ]
    })
  ]}
}

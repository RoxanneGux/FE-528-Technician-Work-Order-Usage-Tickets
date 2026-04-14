import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AwNavigationMenuComponent,
  AwTopNavigationComponent,
  NavigationMenu,
  NavigationOptions,
  UserInformation,
  TopNavigationOptions,
  SearchOption,
  NavigationThemeLabel,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AwNavigationMenuComponent,
    AwTopNavigationComponent,
    AwIconComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly _themeService = inject(ThemeService);

  title = 'fe-harness';

  isDarkMode = this._themeService.isDarkMode;
  toggleTheme = () => this._themeService.toggleTheme();

  navigationOptions = signal<NavigationOptions>({
    defaultHomePage: '/',
    enableAwLogo: true,
    onLogoClick: () => console.log('Logo clicked')
  });

  userInformation = signal<UserInformation>({
    userName: 'Test User',
    userId: 'TU'
  });

  menuItems = signal<NavigationMenu>({
    menu: [
      { title: 'Work Order Details', active: true },
      { title: 'Feature Page' }
    ]
  });

  topNavOptions = signal<TopNavigationOptions>({
    locationFilter: false,
    profileBarColor: NavigationThemeLabel.LtGrey
  });

  searchOptions = signal<SearchOption[]>([]);
}

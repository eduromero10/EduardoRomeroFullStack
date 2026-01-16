import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.page').then((m) => m.MainPage),
  },
  {
    path: 'create-acount',
    loadComponent: () =>
      import('./create-acount/create-acount.page').then(
        (m) => m.CreateAcountPage
      ),
  },
  {
    path: 'book-list',
    loadComponent: () =>
      import('./book-list/book-list.page').then((m) => m.BookListPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.page').then(
        (m) => m.ProfilePage
      ),
  },
  
  {
    path: 'otherprofile/:id',
    loadComponent: () =>
      import('./otherprofile/otherprofile.page').then((m) => m.OtherProfilePage),
  },

   {
    path: '**',
    redirectTo: '',
  },
];

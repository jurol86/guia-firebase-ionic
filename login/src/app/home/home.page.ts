import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, schoolOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon
  ]
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarioLogueado: any = null;
  perfilNoSQL: any = null;

  constructor() {
    addIcons({ logOutOutline, schoolOutline });
  }

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.usuarioLogueado = user;
        this.perfilNoSQL = await this.authService.obtenerPerfilUsuario(user.uid);
      } else {
        this.usuarioLogueado = null;
        this.perfilNoSQL = null;
      }
    });
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}

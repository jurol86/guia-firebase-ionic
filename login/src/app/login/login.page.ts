import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonInput,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonCard,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon
  ]
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  formulario!: FormGroup;
  esRegistro: boolean = false;
  verContrasena: boolean = false;

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombreUsuario: ['']
    });
  }

  alternarModo() {
    this.esRegistro = !this.esRegistro;
    const controlNombre = this.formulario.get('nombreUsuario');

    if (this.esRegistro) {
      controlNombre?.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      controlNombre?.clearValidators();
      controlNombre?.setValue('');
    }
    controlNombre?.updateValueAndValidity();
  }

  async enviarFormulario() {
    if (this.formulario.invalid) return;

    const { email, password, nombreUsuario } = this.formulario.value;
    const loading = await this.loadingCtrl.create({
      message: this.esRegistro ? 'Procesando registro...' : 'Validando acceso...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (this.esRegistro) {
        await this.authService.registrar(email, password, nombreUsuario);
        await this.mostrarAlerta('Registro Exitoso', 'La cuenta académica ha sido creada con éxito.');
      } else {
        await this.authService.login(email, password);
      }
      this.router.navigate(['/home']);
    } catch (error: any) {
      await this.mostrarAlerta('Autenticación Fallida', this.traducirError(error.code));
    } finally {
      await loading.dismiss();
    }
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  private traducirError(codigo: string): string {
    switch (codigo) {
      case 'auth/invalid-credential':
        return 'Las credenciales ingresadas son incorrectas o no están registradas.';
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya se encuentra registrado.';
      case 'auth/weak-password':
        return 'La seguridad de la contraseña es deficiente (ingrese mínimo 6 caracteres).';
      case 'auth/invalid-email':
        return 'El formato de correo ingresado no cuenta con un formato válido.';
      case 'permission-denied':
      case 'firestore/permission-denied':
        return 'Error de privilegios. Asegúrese de haber configurado las Reglas de Seguridad en Cloud Firestore.';
      case 'unavailable':
        return 'No es posible conectar con Firestore. Habilite el servicio de base de datos.';
      default:
        return `Error del sistema: ${codigo}. Intente de nuevo.`;
    }
  }
}

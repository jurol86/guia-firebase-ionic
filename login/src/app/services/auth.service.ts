import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable reactivo de monitoreo de estado en vivo de la sesión
  user$: Observable<User | null> = user(this.auth);

  async registrar(email: string, contrasena: string, nombreUsuario: string) {
    try {
      // 1. Registro de credenciales en Auth
      const credenciales = await createUserWithEmailAndPassword(this.auth, email, contrasena);
      const uid = credenciales.user.uid;

      // 2. Expediente NoSQL en Firestore mapeado con su UID
      const docRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(docRef, {
        correo: email,
        nombreUsuario: nombreUsuario,
        rol: 'estudiante',
        fechaCreacion: new Date().toISOString()
      });

      return credenciales.user;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, contrasena: string) {
    try {
      const credenciales = await signInWithEmailAndPassword(this.auth, email, contrasena);
      return credenciales.user;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPerfilUsuario(uid: string) {
    const docRef = doc(this.firestore, `usuarios/${uid}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }

  logout() {
    return signOut(this.auth);
  }
}

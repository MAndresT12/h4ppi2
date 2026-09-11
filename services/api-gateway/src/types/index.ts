//Ojo solo necesito el tipo de dato, no necesito la implementación de la clase ni de los métodos. Solo necesito los tipos de datos que se usan en el proyecto para poder generar un archivo de tipado para TypeScript.
//No ocupo por ejemplo Types.ObjectId() (se ejecuta en runtime), solo necesito el tipo de dato que se usa en el proyecto para poder generar un archivo de tipado para TypeScript.

import type { Types } from 'mongoose';

// ──────────────────────────────────────────────
//  Tipos de dominio — H4ppi
// ──────────────────────────────────────────────

/** Categorías posibles de un evento */
export type EventCategory =
  | 'sports'
  | 'music'
  | 'party'
  | 'walk'
  | 'run'
  | 'other';

/*En otro archivo podria ir
import type { EventCategory } from '../types/index.js';

const category: EventCategory = 'sports'; */

/**
 * Estado del ciclo de vida del evento:
 *  open     → recibiendo participantes
 *  ongoing  → en progreso (ya empezó)
 *  closed   → admin cerró el cupo / finalizó — se revela descripción oculta
 *  done     → completamente terminado (histórico)
 */
export type EventStatus = 'open' | 'ongoing' | 'closed' | 'done';

/** Restricción de género del evento */
export type GenderFilter = 'all' | 'm' | 'f' | 'trans' | 'other';

/*OJO! Aqui ya no estamos diciendo que el valor puede ser A, B o C como arriba
estamos describiendo un OBJETO, no un tipo de dato 
type debe ser exactamente Point, y coordinates debe ser una tupla*/
/** Punto GeoJSON (lat/lng para MongoDB 2dsphere) */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitud, latitud]  ← MongoDB usa [lng, lat]
}
/*Ejemplo: 
import type { GeoPoint } from './types/index.js';
const point: GeoPoint = {
  type: 'Point',
  coordinates: [-78.47, -0.18]
}; 

No es lo mismo que number[] porque number[] puede tener cualquier cantidad de elementos, mientras que [number, number] es una tupla que debe tener exactamente dos elementos.
ejemplo const number: number[] = [1, 2, 3]; // válido
const coordinates: [number, number] = [-78.47, -0.18];
*/


/** Participante embebido dentro del evento */
//invitedBy puede faltar porque tiene ? (opcional)
export interface IParticipant {
  userId: Types.ObjectId;
  joinedAt: Date;
  invitedBy?: Types.ObjectId; // si fue invitado por otro usuario
}

/** Calificación de host */
export interface IRating {
  raterId: Types.ObjectId;
  stars: 1 | 2 | 3 | 4 | 5; //union de literales para restringir a 1, 2, 3, 4 o 5
  comment?: string;
  createdAt: Date;
}

// ──────────────────────────────────────────────
//  Tipos para Express — Request extendido
// ──────────────────────────────────────────────

/** Payload que guarda el JWT decodificado */
//Esta describiendo el objeto que contiene la info del JWT, despues de codificarlo. No es la implementación de la clase ni de los métodos, solo el tipo de dato que se usa en el proyecto para poder generar un archivo de tipado para TypeScript.
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
/*Ejemplo de uso:
import type { JwtPayload } from './types/index.js';
const payload: JwtPayload = {
  userId: '123',
  email: 'milton@example.com',
  iat: 1720000000,
  exp: 1720003600
};
*/


// Extiende el Request de Express para incluir el usuario autenticado
/*Express ya tiene algo parecido a:
interface Request {
  //muchas propiedades como body, params, query, headers, etc.
}   
  req.body, req.params, req.query, req.headers, etc.
  Pero mi middleware querra saber si el usuario esta autenticado y si lo esta, guardara el payload del JWT en req.user. 
  Por eso extendemos la interfaz Request de Express para incluir la propiedad user de tipo JwtPayload.
  req.user
  Asi luego se escribira por ejemplo:
    app.get('/profile', (req, res) => {
    console.log(req.user);
    });

  Luego, TypeScript sabe que req.user, puede ser JwtPayload o undefined, y nos dara autocompletado y validacion de tipos.
*/
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ──────────────────────────────────────────────
//  DTOs (Data Transfer Objects) — Validación
// ──────────────────────────────────────────────

/** Body para crear un evento */
//Data Transfer Object (DTO), es una forma de describir que estructura de datos entra o sale de una parte de la aplicacion.
export interface CreateEventDTO {
  name: string;
  description: string;
  hiddenDescription?: string;
  category: EventCategory;
  gender: GenderFilter;
  date: string;        // ISO string "2024-06-15"
  time: string;        // "HH:MM"
  maxParticipants: number;
  radius: number;      // kilómetros
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
/*  Cuando mi codigo maneja los datos para crear un evento, espero un
objeto con esta forma:
Ejemplo:

const data: CreateEventDTO = {
  name: 'Caminata',
  description: 'Caminata por el parque',
  category: 'walk',
  gender: 'all',
  date: '2026-09-20',
  time: '09:00',
  maxParticipants: 15,
  radius: 5,
  address: 'Parque Metropolitano',
  location: {
    latitude: -0.18,
    longitude: -78.47
  }
};


*/

/** Body para actualizar parcialmente un evento */
export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventStatus;
}

/** Query params para buscar eventos cercanos */
export interface NearbyEventsQuery {
  lat: string;
  lng: string;
  radius?: string;       // km (default: 5)
  category?: EventCategory;
  gender?: GenderFilter;
  status?: EventStatus;
  page?: string;
  limit?: string;
}
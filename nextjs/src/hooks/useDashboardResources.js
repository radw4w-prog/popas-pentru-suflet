'use client';
import {useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || '';
export const dashboardResources = {
  verse: {label: 'Versetul zilei', path: '/api/verses/versetul-zilei', valid: d => typeof d.verset?.text === 'string' && !!d.verset.text.trim()},
  thought: {label: 'Gândul și rugăciunea zilei', path: '/api/verses/gandul-zilei', valid: d => !!d.gand?.text && !!d.rugaciune?.text},
  plan: {label: 'Planul de citire', path: '/api/reading/today', private: true, valid: d => Array.isArray(d.capitole)},
  progress: {label: 'Progresul lecturii', path: '/api/reading/progress', private: true, valid: d => Number.isFinite(d.procent)},
};
export function dashboardError(error) {
  if (error.response?.status === 401) return {kind: 'session', message: 'Sesiunea a expirat sau nu este validă. Autentifică-te din nou.'};
  if (error.response?.status === 403) return {kind: 'permission', message: 'Nu ai acces la această informație.'};
  if (error.response?.status === 429) return {kind: 'temporary', message: 'Prea multe cereri. Așteaptă puțin înainte să reîncerci.'};
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return {kind: 'temporary', message: 'Serverul răspunde prea greu. Reîncearcă peste câteva momente.'};
  return {kind: 'temporary', message: 'Nu am putut actualiza această zonă. Verifică legătura la internet și reîncearcă.'};
}

export default function useDashboardResources(isAuthenticated, user) {
  const owner = isAuthenticated ? String(user?.id || user?._id || 'authenticated') : 'guest';
  const [snapshot, setSnapshot] = useState({owner: null, items: {}});
  const active = useRef(null);
  const controllers = useRef({});

  const reload = useCallback(async key => {
    const resource = dashboardResources[key];
    if (!resource || (resource.private && !isAuthenticated)) return;
    controllers.current[key]?.abort();
    const controller = new AbortController();
    controllers.current[key] = controller;
    const current = () => active.current === owner && !controller.signal.aborted && controllers.current[key] === controller;
    if (!current()) return;
    setSnapshot(previous => ({owner, items: {...(previous.owner === owner ? previous.items : {}), [key]: {...(previous.owner === owner ? previous.items[key] : {}), loading: true, error: null}}}));
    try {
      const token = resource.private ? localStorage.getItem('token') : null;
      const response = await axios.get(`${API}${resource.path}`, {
        timeout: 20000, signal: controller.signal,
        headers: token ? {Authorization: `Bearer ${token}`} : {},
      });
      if (!response.data?.success || !resource.valid(response.data)) throw new Error('Invalid dashboard response');
      if (current()) setSnapshot(previous => ({owner, items: {...previous.items, [key]: {data: response.data, loading: false, error: null}}}));
    } catch (error) {
      if (!current()) return;
      const failure = dashboardError(error);
      setSnapshot(previous => ({owner, items: {...previous.items, [key]: {
        data: failure.kind === 'session' || failure.kind === 'permission' ? null : previous.items[key]?.data,
        loading: false, error: failure,
      }}}));
    }
  }, [owner, isAuthenticated]);

  useEffect(() => {
    active.current = owner;
    setSnapshot({owner, items: {}});
    Object.keys(dashboardResources).forEach(key => {void reload(key);});
    const interval = setInterval(() => {void reload('verse');}, 30 * 60 * 1000);
    return () => {
      active.current = null;
      clearInterval(interval);
      Object.values(controllers.current).forEach(controller => controller.abort());
      controllers.current = {};
    };
  }, [owner, reload]);

  // Ascunde imediat datele altui cont, înainte de rularea efectului.
  return {items: snapshot.owner === owner ? snapshot.items : {}, reload};
}

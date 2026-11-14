-- Pega TODO esto en Supabase > SQL Editor > Run. Se puede ejecutar más de una vez sin problema.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null default 'secretaria' check (rol in ('admin','doctor','secretaria')),
  activo boolean not null default true
);
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id),
  servicio text not null,
  fecha date not null,
  hora text not null,
  nombre text not null,
  telefono text not null,
  correo text not null,
  estado text not null default 'Pendiente' check (estado in ('Pendiente','Confirmada','Completada')),
  created_at timestamptz not null default now(),
  unique (doctor_id, fecha, hora)
);
create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, correo text not null, telefono text, mensaje text not null,
  created_at timestamptz not null default now()
);

create or replace function public.nuevo_perfil() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, nombre) values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1))) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.nuevo_perfil();
insert into public.profiles(id, nombre) select id, split_part(email,'@',1) from auth.users on conflict do nothing;

create or replace function public.mi_rol() returns text language sql stable security definer set search_path = public as $$
  select rol from public.profiles where id = auth.uid() and activo $$;

alter table public.profiles enable row level security;
alter table public.citas enable row level security;
alter table public.mensajes enable row level security;

drop policy if exists "ver perfiles" on public.profiles;
drop policy if exists "admin edita perfiles" on public.profiles;
drop policy if exists "ver citas" on public.citas;
drop policy if exists "cambiar estado" on public.citas;
drop policy if exists "borrar citas" on public.citas;
drop policy if exists "ver mensajes" on public.mensajes;
drop policy if exists "borrar mensajes" on public.mensajes;

create policy "ver perfiles" on public.profiles for select to authenticated using (id = auth.uid() or public.mi_rol() is not null);
create policy "admin edita perfiles" on public.profiles for update to authenticated using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');
create policy "ver citas" on public.citas for select to authenticated
  using (public.mi_rol() in ('admin','secretaria') or (public.mi_rol() = 'doctor' and doctor_id = auth.uid()));
create policy "cambiar estado" on public.citas for update to authenticated
  using (public.mi_rol() in ('admin','secretaria') or (public.mi_rol() = 'doctor' and doctor_id = auth.uid()))
  with check (public.mi_rol() in ('admin','secretaria') or (public.mi_rol() = 'doctor' and doctor_id = auth.uid()));
create policy "borrar citas" on public.citas for delete to authenticated using (public.mi_rol() in ('admin','secretaria'));
create policy "ver mensajes" on public.mensajes for select to authenticated using (public.mi_rol() in ('admin','secretaria'));
create policy "borrar mensajes" on public.mensajes for delete to authenticated using (public.mi_rol() in ('admin','secretaria'));

revoke update on public.citas from authenticated;    grant update (estado) on public.citas to authenticated;
revoke update on public.profiles from authenticated; grant update (nombre, rol, activo) on public.profiles to authenticated;
revoke all on public.citas, public.profiles, public.mensajes from anon;

create or replace function public.doctores_publicos() returns table(id uuid, nombre text) language sql stable security definer set search_path = public as $$
  select id, nombre from public.profiles where activo and rol in ('admin','doctor') order by nombre $$;

create or replace function public.horas_ocupadas(p_doctor uuid, p_fecha date) returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(hora), '{}') from public.citas where doctor_id = p_doctor and fecha = p_fecha $$;

create or replace function public.reservar_cita(p_doctor uuid, p_servicio text, p_fecha date, p_hora text, p_nombre text, p_telefono text, p_correo text)
returns void language plpgsql security definer set search_path = public as $$
declare hoy date := (now() at time zone 'America/Santo_Domingo')::date;
begin
  if p_servicio not in ('ortodoncia','blanqueamiento','endodoncia','limpieza','estetica') then raise exception 'servicio invalido'; end if;
  if p_fecha < hoy or extract(dow from p_fecha) = 0 then raise exception 'fecha invalida'; end if;
  if p_hora !~ '^(08|09|10|11|13|14|15|16):00$' or (extract(dow from p_fecha) = 6 and p_hora >= '12:00') then raise exception 'hora invalida'; end if;
  if not exists (select 1 from public.profiles where id = p_doctor and activo and rol in ('admin','doctor')) then raise exception 'doctor invalido'; end if;
  p_nombre := trim(regexp_replace(p_nombre, '[<>]', '', 'g'));
  if char_length(p_nombre) not between 3 and 80 or p_telefono !~ '^[0-9 ()+-]{10,20}$' or p_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_correo) > 80 then raise exception 'datos invalidos'; end if;
  if (select count(*) from public.citas where telefono = p_telefono and estado = 'Pendiente' and fecha >= hoy) >= 2 then raise exception 'citas pendientes'; end if;
  insert into public.citas(doctor_id, servicio, fecha, hora, nombre, telefono, correo) values (p_doctor, p_servicio, p_fecha, p_hora, p_nombre, p_telefono, p_correo);
exception when unique_violation then raise exception 'horario ocupado';
end $$;

create or replace function public.enviar_mensaje(p_nombre text, p_correo text, p_telefono text, p_mensaje text)
returns void language plpgsql security definer set search_path = public as $$
begin
  p_nombre := trim(regexp_replace(p_nombre, '[<>]', '', 'g')); p_mensaje := trim(regexp_replace(p_mensaje, '[<>]', '', 'g'));
  if char_length(p_nombre) not between 2 and 80 or char_length(p_mensaje) not between 5 and 1000 or p_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_correo) > 80 or char_length(coalesce(p_telefono,'')) > 20 then raise exception 'datos invalidos'; end if;
  if (select count(*) from public.mensajes where correo = p_correo and created_at > now() - interval '1 hour') >= 3 then raise exception 'demasiados mensajes'; end if;
  insert into public.mensajes(nombre, correo, telefono, mensaje) values (p_nombre, p_correo, nullif(trim(p_telefono),''), p_mensaje);
end $$;

revoke execute on function public.doctores_publicos, public.horas_ocupadas, public.reservar_cita, public.enviar_mensaje, public.mi_rol from public;
grant execute on function public.doctores_publicos, public.horas_ocupadas, public.reservar_cita, public.enviar_mensaje to anon, authenticated;
grant execute on function public.mi_rol to authenticated;

-- Bucket público "clinica" para imágenes (foto de la doctora: sube doctora.jpg). Solo la administradora sube o borra.
insert into storage.buckets (id, name, public) values ('clinica', 'clinica', true) on conflict (id) do nothing;
drop policy if exists "clinica lectura" on storage.objects;
drop policy if exists "clinica admin sube" on storage.objects;
drop policy if exists "clinica admin edita" on storage.objects;
drop policy if exists "clinica admin borra" on storage.objects;
create policy "clinica lectura" on storage.objects for select using (bucket_id = 'clinica');
create policy "clinica admin sube" on storage.objects for insert to authenticated with check (bucket_id = 'clinica' and public.mi_rol() = 'admin');
create policy "clinica admin edita" on storage.objects for update to authenticated using (bucket_id = 'clinica' and public.mi_rol() = 'admin');
create policy "clinica admin borra" on storage.objects for delete to authenticated using (bucket_id = 'clinica' and public.mi_rol() = 'admin');

-- DESPUÉS de crear tu usuario en Authentication > Users, ejecuta esto con tu correo para ser administradora:
-- update public.profiles set rol = 'admin', nombre = 'Dra. Mely Santos' where id = (select id from auth.users where email = 'TU_CORREO');

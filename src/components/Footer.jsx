import { PHONE, ADDRESS } from '../data'
export default function Footer() {
  return (
    <footer className="foot"><span>© {new Date().getFullYear()} Dra. Mely Santos · Odontóloga</span><span>{ADDRESS} · {PHONE}</span><a href="#admin">Acceso clínica</a></footer>
  )
}

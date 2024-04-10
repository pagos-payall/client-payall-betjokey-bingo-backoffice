'use client'
import RoomsContext from "@/context/RoomsContext";
import { theme } from "../data/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";



export default function Home() {
  const { display_view } = useContext(RoomsContext)
  const router  = useRouter();

  useEffect(()=> router.push(display_view), [])

  return (
    <main style={{
      background: theme.dark.background.primary,
      padding: '10px',
      height: '100%'
    }}>
        <Link href="/dashboard">Dashboard</Link>
    </main>
  );
}

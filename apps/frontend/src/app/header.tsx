'use client'

import Link from "next/link";
import HeaderMenu from "@/component/main/ts/headerMenu";
import {useState} from "react";

export default function Header() {

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div>
            <Link href="/user/login">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                        <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                        <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>
                    </svg>
                </div>
            </Link>
            <div>
                <Link href="/">
                    <img
                        src="https://gap.synology.me/web_images/gapdropboxcdn/header/eplogoBlack.jpg"
                        alt=""
                    />
                </Link>
            </div>
            <div onClick={() => setMenuOpen(true)}>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M4 6l16 0"/>
                        <path d="M4 12l16 0"/>
                        <path d="M4 18l16 0"/>
                    </svg>
                </div>
            </div>
            {menuOpen &&
                <HeaderMenu onClose={() => setMenuOpen(false)}/>
            }
        </div>
    )
}
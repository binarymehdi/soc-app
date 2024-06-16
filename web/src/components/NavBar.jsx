import { useEffect, useState } from "react";

const NavBar = ({ navigation }) => {
    const [header, setHeader] = useState(false);

    const scrollHeader = () => {
        if (window.scrollY >= 150) {
            setHeader(true);
        }
        else {
            setHeader(false);
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', scrollHeader)
        return () => {
            window.addEventListener('scroll', scrollHeader)
        }
    }, [])
    return (

        <nav
            className={`${header ? "fixed top-0 w-full bg-white z-50" : ""
                } flex items-stretch p-6 lg:px-8 justify-center`}
            aria-label="Global"
        >
            <div className="hidden lg:flex lg:gap-x-12">
                {navigation.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className="text-sm font-semibold leading-6 text-gray-900"
                    >
                        {item.name}
                    </a>
                ))}
            </div>
        </nav>
    )
}

export default NavBar

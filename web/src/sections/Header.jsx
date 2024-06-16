import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import socLogo from "../assets/images/soc-logo.jpeg"
import socMonitoringPicture from "../assets/images/socmonitoringpicture.png"
import TopTitle from "../assets/images/titre_top.png"
import { useEffect, useState } from "react"
import MobileView from '../components/SmallView'
import NavBar from '../components/NavBar'

const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Solutions', href: '#' },
    { name: 'CyberInsights', href: '#' },
    { name: 'About us', href: '#' },
    { name: 'Contact us', href: '#' },
    
]

const Header = () => {

    

    return (
        <div>
            <header className="absolute inset-x-0 top-0 z-50">
                <div className="flex w-full justify-center items-center">
                    <div className='px-2 py-2'>
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img
                                className="h-20 w-auto"
                                src={socLogo}
                                alt=""
                            />
                        </a>
                    </div>
                    <div className='px-2 py-2'>
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img
                                className="h-20 w-auto"
                                src={socMonitoringPicture}
                                alt=""
                            />
                        </a>
                    </div>
                    <MobileView className="" navigation={navigation} />
                </div>
                <NavBar navigation={navigation} />
            </header>
        </div>
    )
}

export default Header

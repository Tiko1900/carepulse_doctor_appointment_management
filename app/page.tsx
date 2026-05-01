import Image from "next/image";
import Link from 'next/link';

import PasskeyModal from "@/components/PasskeyModal";
import { PatientForm } from "@/components/forms/PatientForm";

type SearchParamProps = {
  searchParams: Promise<{ admin: string }>;
};

const Home = async ({ searchParams }:  SearchParamProps) => {
  const { admin } = await searchParams;

  return (
    <div className="flex h-screen max-h-screen">
      {admin && <PasskeyModal />}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <Image 
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />

          <PatientForm />

          <div className="text-14-regular mt-20 flex justify">
            <p className="justify-items-end text-dark-600 xl:text-left">
              @ 2026 CarePulse
            </p>
            <Link href="/?admin=true" className="text-green-500 ml-1">Admin</Link>
          </div>
        </div>
      </section>

      <Image src="/assets/images/onboarding-img.png" height={1000} width={1000} alt="patient" className="side-img max-w-[50%]" />
    </div>
  )
}

export default Home
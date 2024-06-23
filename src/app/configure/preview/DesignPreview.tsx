"use client"

import Phone from "@/components/Phone";
import { Button } from "@/components/ui/button";
import { BASE_PRICE, PRODUCTS_PRiCES } from "@/config/products";
import { cn, formatPrice } from "@/lib/utils";
import { COLORS, MODELS } from "@/validators/option-validator";
import { Configuration } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { create } from "domain";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti"
import { createCheckoutSession } from "./actions";
import { url } from "inspector";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import LoginModal from "@/components/LoginModal";

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {

  const router = useRouter()
  const { toast } = useToast()

  const { id } = configuration
  const { user } = useKindeBrowserClient()
  const [isloginModalOpen, setIsLoginModalOpen] = useState(false)

  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => setShowConfetti(true))

  const { color, model, finish, material } = configuration
  const tw = COLORS.find((supportedColor) => supportedColor.value === color)?.tw

  const { label: modelLabel } = MODELS.options.find(({ value }) => value === model)!

  let totalPrice = BASE_PRICE
  if (material === "polycarbonate") totalPrice += PRODUCTS_PRiCES.material.polycarbonate
  if (finish === "textured") totalPrice += PRODUCTS_PRiCES.finish.textured

  const { mutate: createPaymentSession } = useMutation({
    mutationKey: ['get-checkout-session'],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) router.push(url)
      else throw new Error('No url provided')
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: 'There was an error creating the checkout session. Please try again later.',
        variant: 'destructive'
      })
    }
  })

  const handleCheckout = () => {
    if (user) {
      createPaymentSession({ configId: id })
    } else {
      localStorage.setItem("configurationId", id)
      setIsLoginModalOpen(true)

    }
  }

  return <>
    <div className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center">
      <Confetti active={showConfetti} config={{ elementCount: 200, spread: 90 }} />
    </div>

    <LoginModal isOpen={isloginModalOpen} setIsOpen={setIsLoginModalOpen} />

    <div className='mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12'>
      <div className='md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2'>
        <Phone
          style={{ userSelect: 'none' }}
          className={cn(`bg-${tw}`, "max-w-[150px] md:max-w-full")}
          imgSrc={configuration.croppedImageUrl!}
        />
      </div>

      <div className='mt-6 sm:col-span-9 md:row-end-1'>
        <h3 className='text-3xl font-bold tracking-tight text-gray-900'>
          Your {modelLabel} Case
        </h3>
        <div className='mt-3 flex items-center gap-1.5 text-base'>
          <Check className='h-4 w-4 text-green-500' />
          In stock and ready to ship
        </div>
      </div>
      <div className="sm:col-span-12 md:col-span-9 text-base">
        <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
          <div>
            <p className="font-medium text-zinc-950">Highlights</p>
            <ol className="mt-2 text-zinc-700 list-disc list-inside">
              <li>Supports wireless charging</li>
              <li>Shock-absorbing TPU material</li>
              <li>Eco-friendly packaging from recycled sources</li>
              <li>Warranty coverage for five years</li>
            </ol>
          </div>
          <div>
            <p className="font-medium text-zinc-950">Materials</p>
            <ol className="mt-3 text-zinc-700 list-disc list-inside">
              <li>Made from premium, long-lasting materials</li>
              <li>Coating resistant to scratches and fingerprints</li>
            </ol>
          </div>
        </div>
        <div className="mt-8">
          <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
            <div className="flow-root text-sm">
              <div className="flex items-center justify-between py-1
              my-2">
                <p className="text-gray-600">Base price</p>
                <p className="font-medium text-gray-900">
                  {formatPrice(BASE_PRICE / 100)}
                </p>
              </div>

              {finish === "textured" ? (
                <div className="flex items-center justify-between py-1
                my-2">
                  <p className="text-gray-600">Textured finish</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(PRODUCTS_PRiCES.finish.textured / 100)}
                  </p>
                </div>
              ) : null}

              {material === "polycarbonate" ? (
                <div className="flex items-center justify-between py-1
                my-2">
                  <p className="text-gray-600">Soft polycarbonate material</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(PRODUCTS_PRiCES.material.polycarbonate / 100)}
                  </p>
                </div>
              ) : null}

              <div className="my-2 h-px bg-gray-200" />
              <div className="flex items-center justify-between py-2">
                <p className="font-semibold text-gray-900">Order total</p>
                <p className="font-semibold text-gray-900">{formatPrice(totalPrice / 100)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end pb-12">
            <Button onClick={() => handleCheckout()} className="px-4 sm:px-6 lg:px-8">Check Out<ArrowRight className="h-4 w-4 ml-1.5 inline" /></Button>
          </div>
        </div>
      </div>
    </div>
  </>
}
export default DesignPreview;
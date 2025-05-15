import localFont from 'next/font/local'

export const meutasFont = localFont({
  src: [
    {
      path: '../public/font/meutas/Meutas-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/meutas/Meutas-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/font/meutas/Meutas-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/font/meutas/Meutas-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/meutas/Meutas-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/font/meutas/Meutas-RegularOblique.otf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-meutas',
}) 
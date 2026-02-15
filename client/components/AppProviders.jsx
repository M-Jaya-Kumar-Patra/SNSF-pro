"use client";

import { ScreenWidthProvider } from "@/app/context/ScreenWidthContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { AlertProvider } from "@/app/context/AlertContext";
import { NoticeProviders } from "@/app/context/NotificationContext";
import { ItemProvider } from "@/app/context/ItemContext";
import { CatProvider } from "@/app/context/CategoryContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { PrdProvider } from "@/app/context/ProductContext";
import { CartProvider } from "@/app/context/CartContext";
import { OrdersProvider } from "@/app/context/OrdersContext";

export default function AppProviders({ children }) {
  return (
    <ScreenWidthProvider>
      <AuthProvider>
        <AlertProvider>
          <NoticeProviders>
            <ItemProvider>
              <CatProvider>
              <CartProvider>
                <WishlistProvider>
                  <OrdersProvider>
                  <PrdProvider>
                    {children}
                  </PrdProvider>
                  </OrdersProvider>
                </WishlistProvider>
                </CartProvider>
              </CatProvider>
            </ItemProvider>
          </NoticeProviders>
        </AlertProvider>
      </AuthProvider>
    </ScreenWidthProvider>
  );
}   

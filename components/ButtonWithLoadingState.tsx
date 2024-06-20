"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  isPending: boolean;
  loadingText: string;
  text: string;
};

export default function ButtonWithLoadingState({
  isPending,
  loadingText,
  text,
}: Props) {
  //* Dependencies include react-query, shadcn and lucid-react

  return (
    <div>
      <Button disabled={isPending} type="submit">
        {isPending ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            {loadingText}...
          </>
        ) : (
          <>{text}</>
        )}
      </Button>
    </div>
  );
}

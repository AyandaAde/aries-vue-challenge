"use client";

import { OptionsContract } from "@/lib/types";
import { AreaChart } from "@tremor/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format, max } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import ButtonWithLoadingState from "./ButtonWithLoadingState";

const OptionsFormSchema = z.object({
  strike_price: z.string({
    required_error: "Strike price is required",
  }),
  type: z.string({
    required_error: "Option type is required",
  }),
  bid: z.string({
    required_error: "Bid price is required",
  }),
  ask: z.string({
    required_error: "Ask price is required",
  }),
  long_short: z.string({
    required_error: "Position type is required",
  }),
  expiration_date: z.date({
    required_error: "Expiration date is required",
  }),
});

type OptionsSchemaType = z.infer<typeof OptionsFormSchema>;

type Props = {
  optionsData: OptionsContract[];
};

export function CodingChallenge({ optionsData }: Props) {
  const [options, setOptions] = useState<OptionsContract[]>(optionsData);
  let maxProfitArr = [];
  let maxLossArr = [];
  let breakEvenPoints = [];

  const optionsForm = useForm<OptionsSchemaType>({
    resolver: zodResolver(OptionsFormSchema),
  });

  const submitOptionData = useMutation({
    mutationFn: async (data: OptionsSchemaType) => {
      if (options === optionsData) {
        setOptions([data]);
        return;
      }
      setOptions([...options, data]);
    },
  });

  function onSubmit(data: OptionsSchemaType) {
    if (options !== optionsData && options.length === 4) {
      toast.error(
        "You have reached the maximum number of options you can add. Please refresh the page to add more options."
      );
      return;
    }
    submitOptionData.mutate(data, {
      onSuccess() {
        toast.success("Option added successfully");
        optionsForm.reset();
      },
      onError(error) {
        console.log(error);
        toast.error("Failed to add option");
        optionsForm.reset();
      },
    });
  }
  function createChartData(index: number) {
    let prices = [];

    for (
      let price = parseFloat(options[index].strike_price) - 100;
      price <= parseFloat(options[index].strike_price) + 100;
      price++
    ) {
      prices.push(price);
    }
    //*Get the chart data for each option contract.

    const chartData = prices.map((price) => {
      let costBasis = "0";
      let profit = 0;
      if (options[index].type === "Call") {
        //* Get the cost basis of the contract.
        costBasis =
          options[index].long_short === "long"
            ? (
                parseFloat(options[index].strike_price) +
                parseFloat(options[index].bid)
              ).toFixed(2)
            : (
                parseFloat(options[index].strike_price) +
                parseFloat(options[index].ask)
              ).toFixed(2);
        //*Push cost basis to breakeven points if it's not already included.
        if (!breakEvenPoints.includes(costBasis))
          breakEvenPoints.push(costBasis);
        if (options[index].long_short === "long") {
          if (price < parseFloat(costBasis)) {
            profit = -parseFloat(options[index].bid);
          } else {
            //* Get the potential profit of the contract.
            profit =
              -Math.max(
                0,
                parseFloat(options[index].strike_price) -
                  parseFloat(options[index].bid)
              ) + price;
          }
        } else {
          if (price < parseFloat(costBasis)) {
            profit = -parseFloat(options[index].ask);
          } else {
            //* Get the potential profit of the contract.
            profit =
              Math.max(
                0,
                parseFloat(options[index].strike_price) -
                  parseFloat(options[index].ask)
              ) - price;
          }
        }
      } else {
        //*Get cost basis of the contract
        costBasis =
          options[index].long_short === "long"
            ? (
                parseFloat(options[index].strike_price) -
                parseFloat(options[index].bid)
              ).toFixed(2)
            : (
                parseFloat(options[index].strike_price) -
                parseFloat(options[index].ask)
              ).toFixed(2);
        //*Push cost basis to breakeven points if it's not already included.
        if (!breakEvenPoints.includes(costBasis))
          breakEvenPoints.push(costBasis);
        if (options[index].long_short === "long") {
          if (price > parseFloat(costBasis)) {
            profit = -parseFloat(options[index].bid);
          } else {
            //* Get the potential profit of the contract.
            profit =
              Math.max(
                0,
                parseFloat(options[index].bid) +
                  parseFloat(options[index].strike_price)
              ) - price;
          }
        } else {
          if (price > parseFloat(costBasis)) {
            profit = parseFloat(options[index].ask);
          } else {
            //* Get the potential profit of the contract.
            profit =
              -Math.max(
                0,
                parseFloat(options[index].ask) +
                  parseFloat(options[index].strike_price)
              ) + price;
          }
        }
      }
      //* Get the max profit and max loss of all the contracts
      if (maxProfitArr[index]) {
        if (profit > maxProfitArr[index])
          maxProfitArr[index] = profit.toFixed(2);
      } else {
        maxProfitArr[index] = profit.toFixed(2);
      }
      if (maxLossArr[index]) {
        if (profit < maxLossArr[index]) maxLossArr[index] = profit.toFixed(2);
      } else {
        maxLossArr[index] = profit.toFixed(2);
      }
      const returnData = {
        price,
        profit,
      };
      return returnData;
    });

    return chartData;
  }

  const charts = options.map((_, index) => {
    return createChartData(index);
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mb-12 underline">
        Options Profit Calculator
      </h1>
      <div className="flex flex-col md:flex-row">
        <Form {...optionsForm}>
          <form
            onSubmit={optionsForm.handleSubmit(onSubmit)}
            className="mx-auto mt-6 mb-5 w-[250px] md:w-5/12 gap-5 justify-center flex flex-wrap bg-[#bf996d] rounded-lg py-5"
          >
            <h1 className="text-2xl md:text-3xl w-full font-medium underline">
              Calculator
            </h1>
            <FormField
              control={optionsForm.control}
              name="strike_price"
              render={({ field }) => (
                <FormItem className="w-full md:w-5/12">
                  <FormLabel>Strike Price</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription className="text-zinc-50">
                    This is the price at which the option contract can be
                    exercised.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={optionsForm.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full md:w-5/12">
                  <FormLabel>Option Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Put">Put</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-zinc-50">
                    This is the type of option contract (Call or Put).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={optionsForm.control}
              name="ask"
              render={({ field }) => (
                <FormItem className="w-full md:w-5/12">
                  <FormLabel>Ask Price</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription className="text-zinc-50">
                    This is the option&apos;s ask price.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={optionsForm.control}
              name="bid"
              render={({ field }) => (
                <FormItem className="w-full md:w-5/12">
                  <FormLabel>Bid Price</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription className="text-zinc-50">
                    This is the option&apos;s bid price.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={optionsForm.control}
              name="long_short"
              render={({ field }) => (
                <FormItem className="w-full md:w-5/12">
                  <FormLabel>Position Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-zinc-50">
                    This is the type of the position (Long or Short).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={optionsForm.control}
              name="expiration_date"
              render={({ field }) => (
                <FormItem className="w-full md:w-5/12">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-transparent hover:bg-white/20",
                            !field.value && "text-zinc-300"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-zinc-50">
                    This is the expiration date of the price.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ButtonWithLoadingState
              isPending={submitOptionData.isPending}
              loadingText="Submitting"
              text="Submit"
            />
          </form>
        </Form>
        <div className="mx-auto flex px-5 flex-wrap w-11/12 gap-y-5">
          <h1 className="text-2xl md:text-3xl w-full font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mb-12 underline">
            Results
          </h1>
          {charts.map((chart, index) => (
            <div key={index} className="mx-auto w-full md:w-1/2">
              <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Option Chart {index + 1}
              </h3>
              <AreaChart
                key={index}
                className="mt-4 h-60 w-full md:w-11/12 md:h-80 bg-white/50 rounded-lg p-5"
                data={chart}
                index="price"
                categories={["profit"]}
                colors={["yellow"]}
                xAxisLabel="Price at time of expiry"
                yAxisLabel="Profit/Loss at price"
                yAxisWidth={30}
              />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-medium mt-5 mx-auto w-full">
                <p>Max Profit: {maxProfitArr[index]}</p>
                <p>Max Loss: {maxLossArr[index]}</p>
                <p>Break Even Points: {breakEvenPoints[index]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

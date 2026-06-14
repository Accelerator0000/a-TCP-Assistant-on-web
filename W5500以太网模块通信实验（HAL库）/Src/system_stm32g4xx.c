/**
  * @file    system_stm32g4xx.c (G431 adapted)
  * @brief   CMSIS Cortex-M4 Device Peripheral Access Layer System Source File.
  */
#include "stm32g4xx.h"

uint32_t SystemCoreClock = 168000000;

const uint8_t  AHBPrescTable[16] = {0U, 0U, 0U, 0U, 0U, 0U, 0U, 0U, 1U, 2U, 3U, 4U, 6U, 7U, 8U, 9U};
const uint8_t  APBPrescTable[8]  = {0U, 0U, 0U, 0U, 1U, 2U, 3U, 4U};

void SystemInit(void)
{
  SCB->CPACR |= ((3UL << 10*2) | (3UL << 11*2));  /* FPU enable */
}

void SystemCoreClockUpdate(void)
{
}

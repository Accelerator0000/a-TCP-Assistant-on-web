/**
  ******************************************************************************
  * @file    stm32g4xx_hal_conf.h (G431 adapted)
  * @brief   HAL configuration file for STM32G4xx.
  ******************************************************************************
  */
#ifndef __STM32G4xx_HAL_CONF_H
#define __STM32G4xx_HAL_CONF_H

#ifdef __cplusplus
 extern "C" {
#endif

/* ########################## Module Selection ############################## */
#define HAL_MODULE_ENABLED
#define HAL_GPIO_MODULE_ENABLED
#define HAL_SPI_MODULE_ENABLED
#define HAL_CORTEX_MODULE_ENABLED
#define HAL_DMA_MODULE_ENABLED
#define HAL_FLASH_MODULE_ENABLED
#define HAL_EXTI_MODULE_ENABLED
#define HAL_PWR_MODULE_ENABLED
#define HAL_RCC_MODULE_ENABLED

/* ########################## Oscillator Values adaptation ####################*/
#if !defined  (HSE_VALUE)
  #define HSE_VALUE    8000000U
#endif
#if !defined  (HSE_STARTUP_TIMEOUT)
  #define HSE_STARTUP_TIMEOUT    100U
#endif
#if !defined  (HSI_VALUE)
  #define HSI_VALUE    16000000U
#endif
#if !defined  (HSI48_VALUE)
  #define HSI48_VALUE  48000000U
#endif
#if !defined  (LSI_VALUE)
 #define LSI_VALUE               32000U
#endif
#if !defined  (LSE_VALUE)
  #define LSE_VALUE    32768U
#endif
#if !defined  (LSE_STARTUP_TIMEOUT)
  #define LSE_STARTUP_TIMEOUT    5000U
#endif

#define  VDD_VALUE                    3300U
#define  TICK_INT_PRIORITY            0x0FU
#define  USE_RTOS                     0U
#define  PREFETCH_ENABLE              0U
#define  INSTRUCTION_CACHE_ENABLE     1U
#define  DATA_CACHE_ENABLE            1U

#define  USE_HAL_ADC_REGISTER_CALLBACKS     0U
#define  USE_HAL_CAN_REGISTER_CALLBACKS     0U
#define  USE_HAL_COMP_REGISTER_CALLBACKS    0U
#define  USE_HAL_CRS_REGISTER_CALLBACKS     0U
#define  USE_HAL_DAC_REGISTER_CALLBACKS     0U
#define  USE_HAL_EXTI_REGISTER_CALLBACKS    0U
#define  USE_HAL_FDCAN_REGISTER_CALLBACKS   0U
#define  USE_HAL_FLASH_REGISTER_CALLBACKS   0U
#define  USE_HAL_HRTIM_REGISTER_CALLBACKS   0U
#define  USE_HAL_I2C_REGISTER_CALLBACKS     0U
#define  USE_HAL_I2S_REGISTER_CALLBACKS     0U
#define  USE_HAL_IRDA_REGISTER_CALLBACKS    0U
#define  USE_HAL_LPTIM_REGISTER_CALLBACKS   0U
#define  USE_HAL_NAND_REGISTER_CALLBACKS    0U
#define  USE_HAL_NOR_REGISTER_CALLBACKS     0U
#define  USE_HAL_OPAMP_REGISTER_CALLBACKS   0U
#define  USE_HAL_PCD_REGISTER_CALLBACKS     0U
#define  USE_HAL_QSPI_REGISTER_CALLBACKS    0U
#define  USE_HAL_RNG_REGISTER_CALLBACKS     0U
#define  USE_HAL_RTC_REGISTER_CALLBACKS     0U
#define  USE_HAL_SAI_REGISTER_CALLBACKS     0U
#define  USE_HAL_SMARTCARD_REGISTER_CALLBACKS   0U
#define  USE_HAL_SMBUS_REGISTER_CALLBACKS   0U
#define  USE_HAL_SPI_REGISTER_CALLBACKS     0U
#define  USE_HAL_SRAM_REGISTER_CALLBACKS    0U
#define  USE_HAL_TIM_REGISTER_CALLBACKS     0U
#define  USE_HAL_UART_REGISTER_CALLBACKS    0U
#define  USE_HAL_USART_REGISTER_CALLBACKS   0U
#define  USE_HAL_WWDG_REGISTER_CALLBACKS    0U

#define USE_SPI_CRC                     0U

#define EXTERNAL_CLOCK_VALUE            8000000U

/* Includes ------------------------------------------------------------------*/
#ifdef HAL_RCC_MODULE_ENABLED
  #include "stm32g4xx_hal_rcc.h"
#endif
#ifdef HAL_GPIO_MODULE_ENABLED
  #include "stm32g4xx_hal_gpio.h"
#endif
#ifdef HAL_EXTI_MODULE_ENABLED
  #include "stm32g4xx_hal_exti.h"
#endif
#ifdef HAL_DMA_MODULE_ENABLED
  #include "stm32g4xx_hal_dma.h"
#endif
#ifdef HAL_CORTEX_MODULE_ENABLED
  #include "stm32g4xx_hal_cortex.h"
#endif
#ifdef HAL_FLASH_MODULE_ENABLED
  #include "stm32g4xx_hal_flash.h"
#endif
#ifdef HAL_PWR_MODULE_ENABLED
  #include "stm32g4xx_hal_pwr.h"
#endif
#ifdef HAL_SPI_MODULE_ENABLED
  #include "stm32g4xx_hal_spi.h"
#endif

#ifdef  USE_FULL_ASSERT
#define assert_param(expr) ((expr) ? (void)0U : assert_failed((uint8_t *)__FILE__, __LINE__))
void assert_failed(uint8_t *file, uint32_t line);
#else
#define assert_param(expr) ((void)0U)
#endif

#ifdef __cplusplus
}
#endif

#endif /* __STM32G4xx_HAL_CONF_H */



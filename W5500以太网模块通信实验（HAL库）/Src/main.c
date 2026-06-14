/* USER CODE BEGIN Header */
/**
  * file: main.c (G431 adapted)
  * MCU:  STM32G431CBT6
  * W5500 SPI1: PA5(SCK), PA6(MISO), PA7(MOSI), PA4(CS), PB0(RST)
  * Clock: HSE 8MHz -> PLL @168MHz
  */
/* USER CODE END Header */
#include "main.h"
#include "spi.h"
#include "gpio.h"

/* USER CODE BEGIN Includes */
#include "wizchip_conf.h"
#include "socket.h"
#include "w5500.h"
/* USER CODE END Includes */

/* USER CODE BEGIN PFP */
void SystemClock_Config(void);
/* USER CODE END PFP */

/* USER CODE BEGIN PD */
#define SOCK_TCPC             1
/* USER CODE END PD */

/* USER CODE BEGIN PM */
/* Pin mapping for G431CBT6:
   W5500_SCK  ---> PA5  (SPI1_SCK)
   W5500_MISO ---> PA6  (SPI1_MISO)
   W5500_MOSI ---> PA7  (SPI1_MOSI)
   W5500_CS   ---> PA4  (GPIO, software NSS)
   W5500_RST  ---> PB0  (GPIO)
*/
/* USER CODE END PM */

/* USER CODE BEGIN PV */
uint8_t  remote_ip[4] = {192,168,1,100};
uint8_t  Gateway_ip[4] = {192,168,1,1};
uint8_t  Board_ip[4] = {192,168,1,55};

uint16_t local_port = 8888;
uint16_t remote_port = 8888;

uint8_t RevBuf[2048];
uint8_t TEST_buff[] = "W5500 G431 data ready\n\r";
uint16_t sLen = sizeof(TEST_buff);

uint16_t Len, Net_Status;
/* USER CODE END PV */
                          
int main(void)
{
  HAL_Init();

  SystemClock_Config();

  MX_GPIO_Init();
  MX_SPI1_Init();

  /* USER CODE BEGIN 2 */
  W5500_ChipInit();
  /* USER CODE END 2 */

  while (1)
  {
    Net_Status = getSn_SR(SOCK_TCPC);

    switch(Net_Status)
    {
    case SOCK_CLOSED:
      socket(SOCK_TCPC, Sn_MR_TCP, local_port, Sn_MR_ND);
      break;
    case SOCK_INIT:
      connect(SOCK_TCPC, remote_ip, remote_port);
      break;
    case SOCK_ESTABLISHED:
      if(getSn_IR(SOCK_TCPC) & Sn_IR_CON)
      {
        setSn_IR(SOCK_TCPC, Sn_IR_CON);
      }
      Len = getSn_RX_RSR(SOCK_TCPC);
      if(Len > 0)
      {
        recv(SOCK_TCPC, RevBuf, Len);
        send(SOCK_TCPC, RevBuf, Len);
      }
      else
      {
        send(SOCK_TCPC, TEST_buff, sLen);
        HAL_Delay(1000);
      }
      break;
    case SOCK_CLOSE_WAIT:
      close(SOCK_TCPC);
      break;
    }
  }
}

void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /* HSE 8MHz, PLL: 8MHz * 42 / 2 = 168MHz */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLM = RCC_PLLM_DIV1;
  RCC_OscInitStruct.PLL.PLLN = 42;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV7;
  RCC_OscInitStruct.PLL.PLLQ = RCC_PLLQ_DIV2;
  RCC_OscInitStruct.PLL.PLLR = RCC_PLLR_DIV2;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_SYSCLK
                              | RCC_CLOCKTYPE_PCLK1 | RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_5) != HAL_OK)
  {
    Error_Handler();
  }
}

void Error_Handler(void)
{
  while (1) {}
}

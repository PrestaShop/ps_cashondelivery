import {
  boDashboardPage,
  boLoginPage,
  boOrdersPage,
  dataCustomers,
  dataOrderStatuses,
  dataPaymentMethods,
  foCartPage,
  foCheckoutPage,
  foCheckoutOrderConfirmationPage,
  foHomePage,
  foLoginPage,
  foModalBlockCartPage,
  foModalQuickViewPage,
  utilsTest,
} from '@prestashop-core/ui-testing';

import { test, expect, Page, BrowserContext } from '@playwright/test';

const baseContext: string = 'modules_ps_cashondelivery_configuration_placeOrderWithIt';

test.describe('Cash on delivery (COD) module - Place an order with it', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let orderReference: string;

  test.beforeAll(async ({ browser }) => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
  });
  test.afterAll(async () => {
    await page.close();
  });

  test.describe('FO - Order a product with Cash on delivery payment', async () => {
    test('should go to FO home page', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToFO', baseContext);

      await foHomePage.goToFo(page);

      const isHomePage = await foHomePage.isHomePage(page);
      expect(isHomePage).toEqual(true);
    });

    test('should go to login page', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToLoginPageFO', baseContext);

      await foHomePage.goToLoginPage(page);

      const pageTitle = await foLoginPage.getPageTitle(page);
      expect(pageTitle).toContain(foLoginPage.pageTitle);
    });

    test('should sign in with default customer', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'sighInFO', baseContext);

      await foLoginPage.customerLogin(page, dataCustomers.johnDoe);

      const isCustomerConnected = await foLoginPage.isCustomerConnected(page);
      expect(isCustomerConnected).toEqual(true);
    });

    test('should add the first product to the cart', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'addProductToCart', baseContext);

      await foLoginPage.goToHomePage(page);

      // Add first product to cart by quick view
      await foHomePage.quickViewProduct(page, 1);
      await foModalQuickViewPage.addToCartByQuickView(page);
      await foModalBlockCartPage.proceedToCheckout(page);

      const pageTitle = await foCartPage.getPageTitle(page);
      expect(pageTitle).toEqual(foCartPage.pageTitle);
    });

    test('should proceed to checkout and check Step Address', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkAddressStep', baseContext);

      await foCartPage.clickOnProceedToCheckout(page);

      const isCheckoutPage = await foCheckoutPage.isCheckoutPage(page);
      expect(isCheckoutPage).toEqual(true);

      const isStepPersonalInformationComplete = await foCheckoutPage.isStepCompleted(
        page,
        foCheckoutPage.personalInformationStepForm,
      );
      expect(isStepPersonalInformationComplete).toEqual(true);
    });

    test('should validate Step Address and go to Delivery Step', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkDeliveryStep', baseContext);

      const isStepAddressComplete = await foCheckoutPage.goToDeliveryStep(page);
      expect(isStepAddressComplete).toEqual(true);
    });

    test('should go to payment step', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToPaymentStep', baseContext);

      const isStepDeliveryComplete = await foCheckoutPage.goToPaymentStep(page);
      expect(isStepDeliveryComplete, 'Step Address is not complete').toEqual(true);
    });

    test('should choose payment method and confirm the order', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'confirmOrder', baseContext);

      // Payment step - Choose payment step
      await foCheckoutPage.choosePaymentAndOrder(page, dataPaymentMethods.cashOnDelivery.moduleName);

      // Check the confirmation message
      const cardTitle = await foCheckoutOrderConfirmationPage.getOrderConfirmationCardTitle(page);
      expect(cardTitle).toContain(foCheckoutOrderConfirmationPage.orderConfirmationCardTitle);

      orderReference = await foCheckoutOrderConfirmationPage.getOrderReferenceValue(page);
      expect(orderReference.length).toBeGreaterThan(0);
    });
  });

  test.describe('BO - Check the last order', async () => {
    test('should login in BO', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'loginBO', baseContext);
  
      await boLoginPage.goTo(page, global.BO.URL);
      await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);
  
      const pageTitle = await boDashboardPage.getPageTitle(page);
      expect(pageTitle).toContain(boDashboardPage.pageTitle);
    });

    test('should go to \'Orders > Orders\' page', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToOrdersPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.ordersParentLink,
        boDashboardPage.ordersLink,
      );

      const pageTitle = await boOrdersPage.getPageTitle(page);
      expect(pageTitle).toContain(boOrdersPage.pageTitle);
    });

    test('should reset all filters and get number of orders', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'resetFiltersFirst', baseContext);

      const numberOfOrders = await boOrdersPage.resetAndGetNumberOfLines(page);
      expect(numberOfOrders).toBeGreaterThan(0);
    });

    test('should check the last order', async () => {
      await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkLastOrder', baseContext);

      const rowOrderReference = await boOrdersPage.getTextColumn(page, 'reference', 1);
      expect(rowOrderReference).toEqual(orderReference);

      const rowOrderPayment = await boOrdersPage.getTextColumn(page, 'payment', 1);
      expect(rowOrderPayment).toEqual(dataPaymentMethods.cashOnDelivery.displayName);

      const rowOrderStatus = await boOrdersPage.getTextColumn(page, 'osname', 1);
      expect(rowOrderStatus).toEqual(dataOrderStatuses.awaitingCashOnDelivery.name);
    });
  });
});

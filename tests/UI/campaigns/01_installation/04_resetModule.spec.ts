import {
  boDashboardPage,
  boLoginPage,
  boModuleManagerPage,
  dataCustomers,
  dataModules,
  foCartPage,
  foCheckoutPage,
  foHomePage,
  foLoginPage,
  foModalBlockCartPage,
  foModalQuickViewPage,
  utilsTest,
} from '@prestashop-core/ui-testing';

import { test, expect, Page, BrowserContext } from '@playwright/test';

const baseContext: string = 'modules_ps_cashondelivery_installation_resetModule';

test.describe('Cash on delivery (COD) module - Reset module', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
  });
  test.afterAll(async () => {
    await page.close();
  });

  test('should login in BO', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).toContain(boDashboardPage.pageTitle);
  });

  test('should go to \'Modules > Module Manager\' page', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToModuleManagerPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.modulesParentLink,
      boDashboardPage.moduleManagerLink,
    );
    await boModuleManagerPage.closeSfToolBar(page);

    const pageTitle = await boModuleManagerPage.getPageTitle(page);
    expect(pageTitle).toContain(boModuleManagerPage.pageTitle);
  });

  test(`should search the module ${dataModules.psCashOnDelivery.name}`, async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'searchModule', baseContext);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toEqual(true);
  });

  test('should display the reset modal and cancel it', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'resetModuleAndCancel', baseContext);

    const textResult = await boModuleManagerPage.setActionInModule(page, dataModules.psCashOnDelivery, 'reset', true);
    expect(textResult).toEqual('');

    const isModuleVisible = await boModuleManagerPage.isModuleVisible(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toEqual(true);

    const isModalVisible = await boModuleManagerPage.isModalActionVisible(page, dataModules.psCashOnDelivery, 'reset');
    expect(isModalVisible).toEqual(false);
  });

  test('should reset the module', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'resetModule', baseContext);

    const successMessage = await boModuleManagerPage.setActionInModule(page, dataModules.psCashOnDelivery, 'reset');
    expect(successMessage).toEqual(boModuleManagerPage.resetModuleSuccessMessage(dataModules.psCashOnDelivery.tag));
  });

  test('should go to Front Office', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToFo', baseContext);

    page = await boModuleManagerPage.viewMyShop(page);
    await foHomePage.changeLanguage(page, 'en');

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

  test(`should check the '${dataModules.psCashOnDelivery.name}' payment module`, async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkPaymentModule', baseContext);

    // Payment step - Choose payment step
    const isVisible = await foCheckoutPage.isPaymentMethodExist(page, dataModules.psCashOnDelivery.tag);
    expect(isVisible).toEqual(true);
  });
});

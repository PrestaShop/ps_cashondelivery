{*
* 2007-2015 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2015 PrestaShop SA
*  @license    http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*}

{capture name=path}
	<a href="{$link->getPageLink('order', true, NULL, "step=3")}" rel="nofollow" title="{l s='Go back to the Checkout' d='Modules.Cashondelivery.Shop'}">{l s='Checkout' d='Shop.Theme.Actions'}</a><span>{$navigationPipe}</span>{l s='Cash on delivery (COD) payment' mod='ps_cashondelivery'}
{/capture}

{include file="$tpl_dir./breadcrumb.tpl"}

<h2>{l s='Order summary' mod='cashondelivery'}</h2>

{assign var='current_step' value='payment'}
{include file="$tpl_dir./order-steps.tpl"}

<h3>{l s='Cash on delivery (COD) payment' mod='ps_cashondelivery'}</h3>

<form action="{$link->getModuleLink('ps_cashondelivery', 'validation', [], true)}" method="post">
	<input type="hidden" name="confirm" value="1">
	<p>
		<img src="{$this_path_cod}ps_cashondelivery.jpg" alt="{l s='Cash on delivery (COD) payment' mod='ps_cashondelivery'}">
		{l s='You have chosen the Cash on Delivery method.' mod='ps_cashondelivery'}
		<br><br>
		{l s='The total amount of your order is' mod='ps_cashondelivery'}
		<span>{convertPrice price=$total}</span>
		{if $use_taxes == 1}
		    {l s='(tax incl.)' mod='ps_cashondelivery'}
		{/if}
	</p>
	<p>
		<br><br>
		<br><br>
		<b>{l s='Please confirm your order by clicking \'I confirm my order\'.' mod='ps_cashondelivery'}</b>
	</p>
	<p>
		<a href="{$link->getPageLink('order', true)}?step=3">{l s='Other payment methods' mod='ps_cashondelivery'}</a>
		<input type="submit" value="{l s='I confirm my order' mod='ps_cashondelivery'}">
	</p>
</form>

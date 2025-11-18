import moment, { type Moment } from 'moment'
import type Stripe from 'stripe'

export class RenewalReminder {
	private stripe: Stripe

	constructor(stripe: Stripe, _today = moment()) {
		this.stripe = stripe
	}

	async getYearlyPlans(): Promise<Stripe.Plan[]> {
		const plans = await this.stripe.plans.list({
			limit: 100,
		})
		const yearlyPlans = plans.data.filter((plan) => plan.interval === 'year')
		return yearlyPlans
	}

	getLastSubscriptionId(subscription: Stripe.ApiList<Stripe.Subscription>): string {
		const length = subscription.data.length
		const last = subscription.data[length - 1]
		return last.id
	}

	async getSubscription(planId: string, lastId = ''): Promise<Stripe.Subscription[]> {
		const param = this.getListSubscriptionParam(planId, lastId)
		const subscriptions = await this.stripe.subscriptions.list(param)
		if (!subscriptions.has_more) {
			return subscriptions.data
		}
		const lastSubId = this.getLastSubscriptionId(subscriptions)
		const moreSub = await this.getSubscription(planId, lastSubId)
		const lists = subscriptions.data
		lists.push(...moreSub)
		return lists
	}

	async getSubscriptionsByPlans(plans: Stripe.Plan[]): Promise<Stripe.Subscription[]> {
		const subscriptions: Stripe.Subscription[] = []
		await Promise.all(
			plans.map(async (plan) => {
				const data = await this.getSubscription(plan.id)
				subscriptions.push(...data)
			}),
		)
		return subscriptions
	}

	async getNotificationTargetSubscription(targetDate = 30): Promise<Stripe.Subscription[]> {
		const today = moment()
		// 年間プラン取得
		const plans = await this.getYearlyPlans()
		// プランについてるsubscription取得
		const subscriptions = await this.getSubscriptionsByPlans(plans)
		// あと${targetDate}日のものをピックアップ
		const targets = this.filterSubscriptions(subscriptions, today, targetDate)
		return targets
	}

	filterSubscriptions(
		subscriptions: Stripe.Subscription[],
		today: Moment = moment(),
		targetDate = 30,
	): Stripe.Subscription[] {
		const targets = subscriptions.filter((subscription) => {
			const end = moment.unix(subscription.current_period_end)
			const dateRemained = end.diff(today, 'day')
			return dateRemained === targetDate
		})
		return targets
	}

	getListSubscriptionParam(planId: string, lastId = ''): Stripe.SubscriptionListParams {
		const param: Stripe.SubscriptionListParams = {
			plan: planId,
			limit: 100,
			created: {
				lte: moment().subtract(335, 'days').unix(),
			},
		}
		if (lastId) param.starting_after = lastId
		return param
	}
}

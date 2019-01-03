<template>
  <div class="tax-warp">
    <h1>个税计算</h1>

    <div class="tax-body">
      <div class="data-source">
        <el-form
          :model="source"
          label-width="150px"
        >
          <el-form-item label="每月收入">
            <el-input v-model="source.pay"></el-input>
          </el-form-item>
          <el-form-item label="个人负担五险一金（／月）">
            <el-input v-model="source.insurance"></el-input>
          </el-form-item>
          <el-form-item label="专项扣除（／月）">
            <el-input v-model="source.remit"></el-input>
          </el-form-item>
          <el-form-item label="年终奖">
            <el-input v-model="source.awards"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              style="float:right;"
              type="primary"
              @click="compute"
            >计 算</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="data-table">
        <el-table
          :data="table.data"
          stripe
          style="width: 100%"
        >
         <el-table-column
          label="月份"
          width="80"
          type="index"
          :index="indexMethod">
          </el-table-column>
          <el-table-column
            v-for="(column,index) in columns"
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      source: {
        // 起征点
        base: 5000,
        // 收入
        pay: 0, // 20000,
        // 五险一金
        insurance: 0, // 3744.58,
        // 减免
        remit: 0, // 1000,
        // 年终奖
        awards: 0// 66000
      },
      taxRateChart: [
        // 税率上限 税率 速算扣除数
        { max: 36000, rate: 3, deduction: 0 },
        { max: 144000, rate: 10, deduction: 2520 },
        { max: 300000, rate: 20, deduction: 16920 },
        { max: 420000, rate: 25, deduction: 31920 },
        { max: 660000, rate: 30, deduction: 52920 },
        { max: 960000, rate: 35, deduction: 85920 },
        { max: Infinity, rate: 45, deduction: 181920 }
      ],
      table: {
        sumShouldTax: 0,
        sumTax: 0,
        columns: [
          { prop: 'case', label: '方案1' },
          { prop: 'monthShouldTax', label: '预扣预缴应纳税所得额' },
          { prop: 'taxRate', label: '税率(%)' },
          { prop: 'tax', label: '个税' }
        ],
        columns2: [
          { prop: 'case2', label: '方案2' },
          { prop: 'monthShouldTax2', label: '预扣预缴应纳税所得额' },
          { prop: 'taxRate2', label: '税率(%)' },
          { prop: 'tax2', label: '个税' }
        ],
        data: []
      }
    }
  },
  computed: {
    columns () {
      let columns = this.table.columns
      if (this.source.awards) {
        columns = columns.concat(this.table.columns2)
      }
      return columns
    }
  },
  methods: {
    fixMoney (money) {
      money = Number(money)
      if (!money) return money
      return Number(money.toFixed(2))
    },
    indexMethod (index) {
      if (index <= 11) {
        return index + 1 + '月'
      } else if (index === 12) {
        return '总计'
      }
      return ''
    },
    compute () {
      let data = {
        sumShouldTax: 0,
        sumTax: 0,
        sumShouldTax2: 0,
        sumTax2: 0,
        awards: this.source.awards,
        averageAwards: 0,
        records: []
      }
      // 方案2
      let data2 = {
        sumShouldTax: 0,
        sumTax: 0,
        awards: 0,
        averageAwards: this.fixMoney(this.source.awards / 12),
        records: []
      }
      let month = 1
      while (month <= 12) {
        let record = this.getMonthRecord(data, month)
        let record2 = this.getMonthRecord(data2, month)
        // 填充方案2
        record.monthShouldTax2 = record2.monthShouldTax
        record.taxRate2 = record2.taxRate
        record.tax2 = record2.tax
        data.records.push(record)
        month++
      }
      data.records.push({
        monthShouldTax: this.fixMoney(data.sumShouldTax),
        tax: this.fixMoney(data.sumTax),
        monthShouldTax2: this.fixMoney(data2.sumShouldTax),
        tax2: this.fixMoney(data2.sumTax)
      })
      this.table.data = data.records
    },
    getMonthRecord (data, month) {
      // 预扣预缴应纳税所得额（月） 总交税额
      let {monthShouldTax, sumShouldTax, sumTax, awards, averageAwards} = data
      let source = this.source
      if (!monthShouldTax) {
        let temp = source.pay - source.insurance - source.remit - source.base + averageAwards
        monthShouldTax = data.monthShouldTax = temp > 0 ? Number(temp) : 0
      }
      // 最后一月添加奖金
      if (month === 12) {
        monthShouldTax += Number(awards)
      }
      // 过往预扣预缴应纳税所得额总和
      sumShouldTax = sumShouldTax + monthShouldTax
      // 本月税率
      let monthTaxRate = this.getTaxRate(sumShouldTax)
      let tax =
        (sumShouldTax * monthTaxRate.rate) / 100 -
        monthTaxRate.deduction -
        sumTax
      tax = this.fixMoney(tax)
      // 添加记录
      data.sumShouldTax = sumShouldTax
      data.sumTax += tax
      let newRecord = {
        monthShouldTax,
        taxRate: monthTaxRate.rate,
        tax
      }
      return newRecord
    },
    getTaxRate (shouldTax) {
      let target = this.taxRateChart[0]
      for (let temp of this.taxRateChart) {
        if (shouldTax <= temp.max) {
          target = temp
          break
        }
      }
      return target
    }
  },
  mounted () {
    this.compute()
  }
}
</script>
<style lang="less" scoped>
.tax-warp {
  .tax-body {
    display: flex;
    flex: 1;
    justify-content: flex-start;
    align-items: center;
    > div {
      width: 50%;
    }
    .data-source {
      padding-right: 10px;
      flex: 0;
      flex-basis:500px;
    }
    .data-table {
    }
  }
}
</style>

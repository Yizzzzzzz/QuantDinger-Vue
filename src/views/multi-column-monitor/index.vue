<template>
  <div class="multi-column-monitor" :class="{ 'theme-dark': isDarkTheme }">
    <!-- Top toolbar: glassmorphism style -->
    <div class="monitor-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <a-icon type="layout" style="margin-right: 8px;" />
          {{ $t('menu.dashboard.multiColumnMonitor') }}
        </h2>
      </div>

      <div class="toolbar-right">
        <!-- Layout Selection Preset -->
        <div class="toolbar-item">
          <span class="label">{{ $t('multi-column-monitor.layout') }}:</span>
          <a-radio-group v-model="layoutPreset" button-style="solid" size="small" @change="handlePresetChange">
            <a-radio-button v-for="p in presets" :key="p.key" :value="p.key">
              <a-icon :type="p.icon" style="margin-right: 4px;" />
              {{ p.name }}
            </a-radio-button>
          </a-radio-group>
        </div>

        <a-divider type="vertical" />

        <!-- Sync Toggles -->
        <div class="toolbar-item">
          <a-checkbox v-model="syncTimeframe">
            {{ $t('multi-column-monitor.syncTimeframe') }}
          </a-checkbox>
        </div>

        <div class="toolbar-item">
          <a-checkbox v-model="syncIndicators">
            {{ $t('multi-column-monitor.syncIndicators') }}
          </a-checkbox>
        </div>

        <a-divider type="vertical" />

        <!-- General Actions -->
        <a-button type="primary" size="small" icon="save" @click="saveCurrentLayout(true)">
          {{ $t('multi-column-monitor.saveLayout') }}
        </a-button>

        <a-button type="default" size="small" icon="redo" @click="resetToDefaultLayout(true)">
          {{ $t('multi-column-monitor.resetLayout') }}
        </a-button>
      </div>
    </div>

    <!-- Grid Container -->
    <div
      class="monitor-grid"
      :style="{
        '--grid-cols': currentLayout.cols,
        '--grid-rows': currentLayout.rows
      }"
    >
      <div
        v-for="(cell, index) in cells"
        :key="cell.id"
        class="grid-cell-card"
        :class="{ 'empty-cell': !cell.symbol }"
      >
        <!-- Cell Header -->
        <div class="cell-header" v-if="cell.symbol">
          <div class="cell-header-left">
            <span class="cell-index-badge">#{{ index + 1 }}</span>
            <!-- Popover symbol picker for quick changing of current cell symbol -->
            <a-popover
              v-model="cell.popoverVisible"
              trigger="click"
              placement="bottomLeft"
              :overlay-class-name="isDarkTheme ? 'dark-popover' : ''"
            >
              <template slot="content">
                <div class="symbol-picker-popover-content">
                  <a-tabs default-active-key="watchlist" size="small">
                    <a-tab-pane key="watchlist" tab="自选股">
                      <div class="popover-list-scroll">
                        <div v-if="!watchlist.length" class="popover-empty">暂无自选</div>
                        <div
                          v-for="w in watchlist"
                          :key="`${w.market}:${w.symbol}`"
                          class="popover-item"
                          @click="selectCellSymbol(cell, w.market, w.symbol)"
                        >
                          <span class="mkt-badge" :class="(w.market || '').toLowerCase()">{{ getMarketLabel(w.market) }}</span>
                          <span class="sym-code">{{ w.symbol }}</span>
                          <span class="sym-name" v-if="w.name">{{ w.name }}</span>
                        </div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane key="search" tab="搜索">
                      <div class="popover-search-pane">
                        <a-input-search
                          v-model="searchQuery"
                          placeholder="搜索交易对/股票..."
                          size="small"
                          @search="performSearch"
                          @change="onSearchChange"
                        />
                        <div class="popover-list-scroll margin-top-8">
                          <div v-if="searching" class="popover-loading"><a-icon type="loading" spin /> 搜索中...</div>
                          <div v-else-if="searched && !searchResults.length" class="popover-empty">无匹配结果</div>
                          <div
                            v-for="item in searchResults"
                            :key="`${item.market}:${item.symbol}`"
                            class="popover-item"
                            @click="selectCellSymbol(cell, item.market, item.symbol)"
                          >
                            <span class="mkt-badge" :class="(item.market || '').toLowerCase()">{{ getMarketLabel(item.market) }}</span>
                            <span class="sym-code">{{ item.symbol }}</span>
                            <span class="sym-name" v-if="item.name">{{ item.name }}</span>
                          </div>
                        </div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane key="popular" tab="热门">
                      <div class="popover-popular-pane">
                        <div class="mkt-group-title">加密货币</div>
                        <div class="tags-row">
                          <a-tag v-for="c in popCrypto" :key="c" @click="selectCellSymbol(cell, 'Crypto', c)">{{ c }}</a-tag>
                        </div>
                        <div class="mkt-group-title margin-top-8">美股 / 其它</div>
                        <div class="tags-row">
                          <a-tag v-for="s in popStocks" :key="s" @click="selectCellSymbol(cell, 'USStock', s)">{{ s }}</a-tag>
                        </div>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                </div>
              </template>
              <a-button type="link" class="cell-symbol-title">
                <span class="wl-opt-tag" :class="'wl-mkt-' + (cell.market || '').toLowerCase()">{{ getMarketLabel(cell.market) }}</span>
                <strong class="symbol-name">{{ cell.symbol }}</strong>
                <a-icon type="down" style="font-size: 10px; margin-left: 4px;" />
              </a-button>
            </a-popover>
          </div>

          <div class="cell-header-right">
            <!-- Cell Timeframe -->
            <a-select
              v-model="cell.timeframe"
              size="small"
              class="cell-timeframe-select"
              @change="value => handleTimeframeChange(cell, value)"
            >
              <a-select-option value="1m">1m</a-select-option>
              <a-select-option value="5m">5m</a-select-option>
              <a-select-option value="15m">15m</a-select-option>
              <a-select-option value="30m">30m</a-select-option>
              <a-select-option value="1H">1H</a-select-option>
              <a-select-option value="4H">4H</a-select-option>
              <a-select-option value="1D">1D</a-select-option>
              <a-select-option value="1W">1W</a-select-option>
            </a-select>

            <!-- Indicator Selector -->
            <a-dropdown :trigger="['click']" placement="bottomRight" :overlay-class-name="isDarkTheme ? 'dark-popover' : ''">
              <a-button size="small" class="cell-indicator-btn">
                <span>指标</span>
                <a-icon type="down" />
              </a-button>
              <a-menu slot="overlay" class="cell-indicator-menu">
                <a-menu-item
                  v-for="ind in indicatorsTemplates"
                  :key="ind.id"
                  @click="toggleIndicatorInCell(cell, ind)"
                >
                  <div class="menu-indicator-item">
                    <a-icon type="check" v-if="isIndicatorActiveInCell(cell, ind.id)" class="check-icon" />
                    <span v-else class="check-placeholder"></span>
                    <span>{{ ind.shortName }}</span>
                  </div>
                </a-menu-item>
              </a-menu>
            </a-dropdown>

            <a-tooltip title="清空标的">
              <a-button size="small" type="link" class="cell-delete-btn" @click="clearCell(cell)">
                <a-icon type="delete" />
              </a-button>
            </a-tooltip>
          </div>
        </div>

        <!-- Cell Body -->
        <div class="cell-body">
          <div v-if="cell.symbol" class="chart-container">
            <kline-chart
              :key="`chart-${cell.id}-${cell.symbol}-${cell.timeframe}-${cell.chartKey}`"
              :symbol="cell.symbol"
              :market="cell.market"
              :timeframe="cell.timeframe"
              :theme="isDarkTheme ? 'dark' : 'light'"
              :activeIndicators="cell.activeIndicators"
              :userId="userId"
              :realtime-enabled="true"
              :hide-indicator-toolbar="true"
            />
          </div>

          <!-- Empty Cell State (Select stock directly inside card) -->
          <div v-else class="cell-empty-state">
            <div class="empty-glow"></div>
            <a-icon type="plus-circle" class="empty-icon" />
            <h3 class="empty-title">{{ $t('multi-column-monitor.emptyTitle') }}</h3>
            <p class="empty-desc">{{ $t('multi-column-monitor.emptyDesc') }}</p>

            <div class="picker-tabs-container">
              <a-tabs default-active-key="watchlist" size="small" class="empty-picker-tabs">
                <a-tab-pane key="watchlist" tab="自选股">
                  <div class="picker-list">
                    <div v-if="!watchlist.length" class="list-empty-hint">暂无自选股，去“AI资产分析”添加</div>
                    <div
                      v-for="w in watchlist"
                      :key="`${w.market}:${w.symbol}`"
                      class="picker-item"
                      @click="selectCellSymbol(cell, w.market, w.symbol)"
                    >
                      <span class="mkt-badge" :class="(w.market || '').toLowerCase()">{{ getMarketLabel(w.market) }}</span>
                      <strong class="code">{{ w.symbol }}</strong>
                      <span class="name" v-if="w.name">{{ w.name }}</span>
                    </div>
                  </div>
                </a-tab-pane>

                <a-tab-pane key="search" tab="搜索">
                  <div class="picker-search-panel">
                    <a-input-search
                      v-model="searchQuery"
                      placeholder="搜索交易对或股票..."
                      size="small"
                      enter-button
                      @search="performSearch"
                      @change="onSearchChange"
                    />
                    <div class="picker-list margin-top-8">
                      <div v-if="searching" class="list-loading-hint"><a-icon type="loading" spin /> 搜索中...</div>
                      <div v-else-if="searched && !searchResults.length" class="list-empty-hint">无匹配结果</div>
                      <div
                        v-for="item in searchResults"
                        :key="`${item.market}:${item.symbol}`"
                        class="picker-item"
                        @click="selectCellSymbol(cell, item.market, item.symbol)"
                      >
                        <span class="mkt-badge" :class="(item.market || '').toLowerCase()">{{ getMarketLabel(item.market) }}</span>
                        <strong class="code">{{ item.symbol }}</strong>
                        <span class="name" v-if="item.name">{{ item.name }}</span>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>

                <a-tab-pane key="popular" tab="热门推荐">
                  <div class="picker-popular">
                    <div class="group-label">加密货币</div>
                    <div class="tags-group">
                      <a-tag v-for="c in popCrypto" :key="c" @click="selectCellSymbol(cell, 'Crypto', c)">{{ c }}</a-tag>
                    </div>
                    <div class="group-label margin-top-8">热门美股</div>
                    <div class="tags-group">
                      <a-tag v-for="s in popStocks" :key="s" @click="selectCellSymbol(cell, 'USStock', s)">{{ s }}</a-tag>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getWatchlist, searchSymbols } from '@/api/market'
import { getUserInfo } from '@/api/login'
import KlineChart from '@/views/indicator-analysis/components/KlineChart.vue'

const popCrypto = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT', 'BNB/USDT']
const popStocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN']

const PRESETS = [
  { name: '1 × 1', key: '1x1', rows: 1, cols: 1, icon: 'border' },
  { name: '1 × 2', key: '1x2', rows: 1, cols: 2, icon: 'pause' },
  { name: '1 × 3', key: '1x3', rows: 1, cols: 3, icon: 'column-width' },
  { name: '2 × 2', key: '2x2', rows: 2, cols: 2, icon: 'appstore' },
  { name: '3 × 2', key: '3x2', rows: 2, cols: 3, icon: 'table' },
  { name: '3 × 3', key: '3x3', rows: 3, cols: 3, icon: 'block' }
]

export default {
  name: 'MultiColumnMonitor',
  components: {
    KlineChart
  },
  data () {
    return {
      presets: PRESETS,
      layoutPreset: '2x2',
      syncTimeframe: true,
      syncIndicators: true,
      
      watchlist: [],
      userId: null,
      
      // Global search state for picker
      searchQuery: '',
      searching: false,
      searched: false,
      searchResults: [],
      searchTimer: null,
      
      popCrypto,
      popStocks,
      
      cells: [],
      
      indicatorsTemplates: [
        { id: 'sma', shortName: 'SMA', defaultParams: { length: 20 } },
        { id: 'ema', shortName: 'EMA', defaultParams: { length: 20 } },
        { id: 'rsi', shortName: 'RSI', defaultParams: { length: 14 } },
        { id: 'macd', shortName: 'MACD', defaultParams: { fast: 12, slow: 26, signal: 9 } },
        { id: 'bb', shortName: 'BB', defaultParams: { length: 20, mult: 2 } },
        { id: 'kdj', shortName: 'KDJ', defaultParams: { period: 9, k: 3, d: 3 } }
      ]
    }
  },
  computed: {
    ...mapState({
      navTheme: state => state.app.theme
    }),
    isDarkTheme () {
      return this.navTheme === 'dark' || this.navTheme === 'realdark'
    },
    currentLayout () {
      return this.presets.find(p => p.key === this.layoutPreset) || this.presets[3]
    }
  },
  created () {
    this.initPage()
  },
  methods: {
    async initPage () {
      await this.loadUserId()
      await this.loadWatchlist()
      this.loadSavedLayout()
    },
    async loadUserId () {
      try {
        const res = await getUserInfo()
        if (res && res.data) {
          this.userId = res.data.id || res.data.user_id || 1
        } else {
          this.userId = 1
        }
      } catch (e) {
        this.userId = 1
      }
    },
    async loadWatchlist () {
      if (!this.userId) return
      try {
        const res = await getWatchlist({ userid: this.userId })
        if (res && res.code === 1 && res.data) {
          this.watchlist = res.data
        }
      } catch (e) {
        console.warn('Load watchlist failed:', e)
      }
    },
    
    // Layout and Cell Management
    loadSavedLayout () {
      const storageKey = `quantdinger:multi-column-layout:${this.userId || 1}`
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const config = JSON.parse(saved)
          this.layoutPreset = config.layoutPreset || '2x2'
          this.syncTimeframe = config.syncTimeframe !== undefined ? config.syncTimeframe : true
          this.syncIndicators = config.syncIndicators !== undefined ? config.syncIndicators : true
          
          const savedCells = config.cells || []
          const requiredCount = this.currentLayout.rows * this.currentLayout.cols
          
          const newCells = []
          for (let i = 0; i < requiredCount; i++) {
            if (savedCells[i]) {
              newCells.push({
                id: i,
                symbol: savedCells[i].symbol || '',
                market: savedCells[i].market || 'Crypto',
                timeframe: savedCells[i].timeframe || '1H',
                activeIndicators: savedCells[i].activeIndicators || [],
                chartKey: 0,
                popoverVisible: false
              })
            } else {
              newCells.push(this.createEmptyCell(i))
            }
          }
          this.cells = newCells
          return
        }
      } catch (e) {
        console.error('Parse saved layout failed:', e)
      }
      
      // Fallback: Default initialization
      this.resetToDefaultLayout(false)
    },
    
    createEmptyCell (id) {
      return {
        id,
        symbol: '',
        market: 'Crypto',
        timeframe: '1H',
        activeIndicators: [],
        chartKey: 0,
        popoverVisible: false
      }
    },
    
    saveCurrentLayout (notify = true) {
      const storageKey = `quantdinger:multi-column-layout:${this.userId || 1}`
      const config = {
        layoutPreset: this.layoutPreset,
        syncTimeframe: this.syncTimeframe,
        syncIndicators: this.syncIndicators,
        cells: this.cells.map(c => ({
          symbol: c.symbol,
          market: c.market,
          timeframe: c.timeframe,
          activeIndicators: c.activeIndicators
        }))
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(config))
        if (notify) {
          this.$message.success(this.$t('multi-column-monitor.layoutSaved'))
        }
      } catch (e) {
        console.error('Save layout failed:', e)
      }
    },
    
    resetToDefaultLayout (notify = true) {
      this.layoutPreset = '2x2'
      const requiredCount = 4
      const defaultData = [
        { symbol: 'BTC/USDT', market: 'Crypto', timeframe: '1H', activeIndicators: [{ id: 'ma_volume', visible: true }, { id: 'sma', params: { length: 20 }, visible: true }] },
        { symbol: 'ETH/USDT', market: 'Crypto', timeframe: '1H', activeIndicators: [{ id: 'ma_volume', visible: true }, { id: 'sma', params: { length: 20 }, visible: true }] },
        { symbol: 'SOL/USDT', market: 'Crypto', timeframe: '1H', activeIndicators: [{ id: 'ma_volume', visible: true }, { id: 'sma', params: { length: 20 }, visible: true }] },
        { symbol: '', market: 'Crypto', timeframe: '1H', activeIndicators: [] }
      ]
      
      const newCells = []
      for (let i = 0; i < requiredCount; i++) {
        const def = defaultData[i] || { symbol: '', market: 'Crypto', timeframe: '1H', activeIndicators: [] }
        newCells.push({
          id: i,
          symbol: def.symbol,
          market: def.market,
          timeframe: def.timeframe,
          activeIndicators: def.activeIndicators,
          chartKey: 0,
          popoverVisible: false
        })
      }
      this.cells = newCells
      
      this.saveCurrentLayout(false)
      
      if (notify) {
        this.$message.success(this.$t('multi-column-monitor.layoutReset'))
      }
    },
    
    handlePresetChange () {
      const requiredCount = this.currentLayout.rows * this.currentLayout.cols
      const currentCount = this.cells.length
      
      if (requiredCount > currentCount) {
        // Add new cells
        for (let i = currentCount; i < requiredCount; i++) {
          this.cells.push(this.createEmptyCell(i))
        }
      } else if (requiredCount < currentCount) {
        // Prune extra cells
        this.cells = this.cells.slice(0, requiredCount)
      }
      
      this.saveCurrentLayout(false)
    },
    
    // Search and Input handling
    onSearchChange () {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      if (!this.searchQuery) {
        this.searchResults = []
        this.searched = false
        return
      }
      this.searchTimer = setTimeout(() => {
        this.performSearch()
      }, 400)
    },
    
    async performSearch () {
      if (!this.searchQuery) return
      this.searching = true
      this.searched = true
      try {
        const res = await searchSymbols({ keyword: this.searchQuery, limit: 15 })
        if (res && res.code === 1 && Array.isArray(res.data)) {
          this.searchResults = res.data
        } else {
          this.searchResults = []
        }
      } catch (e) {
        console.warn('Search failed:', e)
        this.searchResults = []
      } finally {
        this.searching = false
      }
    },
    
    // Cell Operation Methods
    selectCellSymbol (cell, market, symbol) {
      cell.symbol = symbol
      cell.market = market
      cell.popoverVisible = false
      cell.chartKey++
      
      // Clear search
      this.searchQuery = ''
      this.searchResults = []
      this.searched = false
      
      // Sync logic
      if (this.syncTimeframe) {
        const firstActive = this.cells.find(c => c.symbol && c.id !== cell.id)
        if (firstActive) {
          cell.timeframe = firstActive.timeframe
        }
      }
      
      if (this.syncIndicators) {
        const firstActive = this.cells.find(c => c.symbol && c.id !== cell.id)
        if (firstActive) {
          cell.activeIndicators = JSON.parse(JSON.stringify(firstActive.activeIndicators))
        }
      }
      
      this.saveCurrentLayout(false)
    },
    
    clearCell (cell) {
      cell.symbol = ''
      cell.activeIndicators = []
      this.saveCurrentLayout(false)
    },
    
    handleTimeframeChange (cell, timeframe) {
      if (this.syncTimeframe) {
        this.cells.forEach(c => {
          if (c.symbol) {
            c.timeframe = timeframe
            c.chartKey++
          }
        })
      } else {
        cell.chartKey++
      }
      this.saveCurrentLayout(false)
    },
    
    // Indicator configuration per cell
    isIndicatorActiveInCell (cell, indicatorId) {
      return (cell.activeIndicators || []).some(ind => ind.id === indicatorId)
    },
    
    toggleIndicatorInCell (cell, template) {
      const active = this.isIndicatorActiveInCell(cell, template.id)
      
      const toggle = (targetCell) => {
        if (!targetCell.symbol) return
        
        let indicators = targetCell.activeIndicators ? [...targetCell.activeIndicators] : []
        if (active) {
          indicators = indicators.filter(ind => ind.id !== template.id)
        } else {
          indicators.push({
            id: template.id,
            instanceId: `${template.id}_${Date.now()}`,
            params: { ...template.defaultParams },
            style: { color: this.getIndicatorColorForId(template.id), lineWidth: 2 },
            visible: true
          })
        }
        targetCell.activeIndicators = indicators
      }
      
      if (this.syncIndicators) {
        this.cells.forEach(c => {
          toggle(c)
        })
      } else {
        toggle(cell)
      }
      
      this.saveCurrentLayout(false)
    },
    
    getIndicatorColorForId (id) {
      const colors = {
        sma: '#1890ff',
        ema: '#2f54eb',
        rsi: '#722ed1',
        macd: '#eb2f96',
        bb: '#13c2c2',
        kdj: '#fa8c16'
      }
      return colors[id] || '#52c41a'
    },
    
    getMarketLabel (market) {
      const labels = {
        Crypto: '加密',
        USStock: '美股',
        CNStock: 'A股',
        HKStock: '港股',
        Forex: '外汇'
      }
      return labels[market] || market
    }
  }
}
</script>

<style lang="less" scoped>
.multi-column-monitor {
  padding: 16px;
  min-height: calc(100vh - 64px);
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  .monitor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
    z-index: 10;

    .toolbar-left {
      .page-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1f1f1f;
        display: flex;
        align-items: center;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .toolbar-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 13px;
          color: #555;
          font-weight: 500;
        }
      }
    }
  }

  .monitor-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 2), 1fr);
    grid-template-rows: repeat(var(--grid-rows, 2), 1fr);
    gap: 16px;
    flex-grow: 1;
    height: calc(100vh - 150px);
    min-height: 500px;
    width: 100%;

    .grid-cell-card {
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;

      &:hover {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        border-color: rgba(24, 144, 255, 0.3);
      }

      .cell-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
        height: 48px;
        box-sizing: border-box;

        .cell-header-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .cell-index-badge {
            background: #e6f7ff;
            color: #1890ff;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 6px;
          }

          .cell-symbol-title {
            padding: 0;
            color: #262626;
            font-size: 14px;
            display: flex;
            align-items: center;

            .wl-opt-tag {
              font-size: 10px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 4px;
              margin-right: 6px;
              text-transform: uppercase;

              &.wl-mkt-crypto { background: rgba(114, 46, 209, 0.1); color: #722ed1; }
              &.wl-mkt-usstock { background: rgba(82, 196, 26, 0.1); color: #52c41a; }
              &.wl-mkt-cnstock { background: rgba(24, 144, 255, 0.1); color: #1890ff; }
              &.wl-mkt-hkstock { background: rgba(250, 84, 28, 0.1); color: #fa541c; }
              &.wl-mkt-forex { background: rgba(250, 140, 22, 0.1); color: #fa8c16; }
            }
          }
        }

        .cell-header-right {
          display: flex;
          align-items: center;
          gap: 8px;

          .cell-timeframe-select {
            width: 75px;
            ::v-deep .ant-select-selection {
              border-radius: 8px;
            }
          }

          .cell-indicator-btn {
            border-radius: 8px;
          }

          .cell-delete-btn {
            color: #bfbfbf;
            padding: 0 4px;
            &:hover {
              color: #ff4d4f;
            }
          }
        }
      }

      .cell-body {
        flex-grow: 1;
        position: relative;
        overflow: hidden;
        min-height: 0;
        display: flex;
        flex-direction: column;

        .chart-container {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;

          ::v-deep .chart-left {
            height: 100% !important;
            width: 100% !important;
          }
          ::v-deep .chart-wrapper {
            height: 100% !important;
          }
        }

        /* Empty state within card */
        .cell-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 24px;
          box-sizing: border-box;
          text-align: center;
          background: linear-gradient(135deg, rgba(245, 247, 250, 0.6), rgba(195, 207, 226, 0.4));
          position: relative;

          .empty-glow {
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(24, 144, 255, 0.08) 0%, transparent 70%);
            z-index: 1;
          }

          .empty-icon {
            font-size: 40px;
            color: #1890ff;
            margin-bottom: 12px;
            z-index: 2;
            filter: drop-shadow(0 4px 10px rgba(24, 144, 255, 0.2));
            animation: pulse-icon 3s ease-in-out infinite;
          }

          .empty-title {
            font-size: 16px;
            font-weight: 700;
            color: #262626;
            margin-bottom: 4px;
            z-index: 2;
          }

          .empty-desc {
            font-size: 12px;
            color: #8c8c8c;
            margin-bottom: 16px;
            max-width: 280px;
            z-index: 2;
          }

          .picker-tabs-container {
            width: 100%;
            max-width: 320px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 12px;
            padding: 8px 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
            z-index: 2;

            .empty-picker-tabs {
              ::v-deep .ant-tabs-bar {
                margin-bottom: 8px;
                border-bottom: 1px solid #f0f0f0;
              }
              ::v-deep .ant-tabs-tab {
                font-size: 12px;
                padding: 6px 12px;
              }
            }

            .picker-list {
              max-height: 140px;
              overflow-y: auto;
              text-align: left;
              display: flex;
              flex-direction: column;
              gap: 4px;

              .list-empty-hint {
                text-align: center;
                font-size: 11px;
                color: #bfbfbf;
                padding: 16px 0;
              }
              .list-loading-hint {
                text-align: center;
                font-size: 11px;
                color: #1890ff;
                padding: 16px 0;
              }

              .picker-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.2s;

                &:hover {
                  background: #f0f5ff;
                }

                .mkt-badge {
                  font-size: 9px;
                  font-weight: 700;
                  padding: 1px 4px;
                  border-radius: 3px;
                  text-transform: uppercase;
                  
                  &.crypto { background: rgba(114, 46, 209, 0.1); color: #722ed1; }
                  &.usstock { background: rgba(82, 196, 26, 0.1); color: #52c41a; }
                  &.cnstock { background: rgba(24, 144, 255, 0.1); color: #1890ff; }
                }

                .code {
                  font-size: 12px;
                  color: #262626;
                  font-family: monospace;
                }

                .name {
                  font-size: 11px;
                  color: #8c8c8c;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  flex-grow: 1;
                }
              }
            }

            .picker-popular {
              text-align: left;

              .group-label {
                font-size: 11px;
                font-weight: 600;
                color: #8c8c8c;
                margin-bottom: 4px;
              }

              .tags-group {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;

                ::v-deep .ant-tag {
                  margin-right: 0;
                  cursor: pointer;
                  font-size: 11px;
                  border-radius: 4px;
                  transition: all 0.2s;
                  &:hover {
                    border-color: #1890ff;
                    color: #1890ff;
                    background: #f0f5ff;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /* Dark Theme Styling */
  &.theme-dark {
    background: #0a0a0a;

    .monitor-toolbar {
      background: rgba(28, 28, 28, 0.7);
      border-color: rgba(255, 255, 255, 0.05);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);

      .toolbar-left .page-title {
        color: #e8e8e8;
      }

      .toolbar-right .toolbar-item .label {
        color: #8c8c8c;
      }
      
      ::v-deep .ant-checkbox-wrapper {
        color: #8c8c8c;
      }
    }

    .monitor-grid {
      .grid-cell-card {
        background: #1c1c1c;
        border-color: #2a2a2a;

        &:hover {
          border-color: rgba(24, 144, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .cell-header {
          background: #181818;
          border-bottom-color: #2a2a2a;

          .cell-header-left {
            .cell-index-badge {
              background: rgba(24, 144, 255, 0.15);
              color: #40a9ff;
            }

            .cell-symbol-title {
              color: #e8e8e8;
              
              .wl-opt-tag {
                &.wl-mkt-crypto { background: rgba(167, 139, 250, 0.15); color: #b78beb; }
                &.wl-mkt-usstock { background: rgba(74, 222, 128, 0.15); color: #52c41a; }
                &.wl-mkt-cnstock { background: rgba(64, 169, 255, 0.15); color: #40a9ff; }
                &.wl-mkt-hkstock { background: rgba(255, 122, 69, 0.15); color: #ff7a45; }
                &.wl-mkt-forex { background: rgba(255, 197, 61, 0.15); color: #ffc53d; }
              }
            }
          }

          .cell-header-right {
            .cell-delete-btn {
              color: #555;
              &:hover {
                color: #ff4d4f;
              }
            }
          }
        }

        .cell-body {
          .cell-empty-state {
            background: linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(40, 40, 40, 0.6));

            .empty-glow {
              background: radial-gradient(circle, rgba(24, 144, 255, 0.05) 0%, transparent 70%);
            }

            .empty-icon {
              color: #40a9ff;
            }

            .empty-title {
              color: #e8e8e8;
            }

            .empty-desc {
              color: #7f7f7f;
            }

            .picker-tabs-container {
              background: rgba(30, 30, 30, 0.85);
              border-color: rgba(255, 255, 255, 0.05);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

              ::v-deep .ant-tabs-bar {
                border-bottom-color: #2a2a2a;
              }
              
              ::v-deep .ant-tabs-tab {
                color: #8c8c8c;
                &:hover {
                  color: #ffffff;
                }
              }
              ::v-deep .ant-tabs-tab-active {
                color: #1890ff;
              }

              .picker-list {
                .list-empty-hint {
                  color: #555;
                }

                .picker-item {
                  &:hover {
                    background: #252525;
                  }

                  .mkt-badge {
                    &.crypto { background: rgba(167, 139, 250, 0.15); color: #b78beb; }
                    &.usstock { background: rgba(74, 222, 128, 0.15); color: #52c41a; }
                    &.cnstock { background: rgba(64, 169, 255, 0.15); color: #40a9ff; }
                  }

                  .code {
                    color: #e8e8e8;
                  }

                  .name {
                    color: #7f7f7f;
                  }
                }
              }

              .picker-popular {
                .group-label {
                  color: #7f7f7f;
                }

                ::v-deep .ant-tag {
                  background: #252525;
                  border-color: #3a3a3a;
                  color: #8c8c8c;
                  &:hover {
                    border-color: #1890ff;
                    color: #1890ff;
                    background: rgba(24, 144, 255, 0.1);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/* Helper Utilities */
.margin-top-8 { margin-top: 8px; }
.margin-top-12 { margin-top: 12px; }

/* Pulse animation for empty icon */
@keyframes pulse-icon {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

/* Popover Content Styling */
.symbol-picker-popover-content {
  width: 280px;

  ::v-deep .ant-tabs-bar {
    margin-bottom: 8px;
  }

  .popover-list-scroll {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .popover-empty {
    text-align: center;
    font-size: 12px;
    color: #bfbfbf;
    padding: 16px 0;
  }
  
  .popover-loading {
    text-align: center;
    font-size: 12px;
    color: #1890ff;
    padding: 16px 0;
  }

  .popover-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f0f5ff;
    }

    .mkt-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
      
      &.crypto { background: rgba(114, 46, 209, 0.1); color: #722ed1; }
      &.usstock { background: rgba(82, 196, 26, 0.1); color: #52c41a; }
      &.cnstock { background: rgba(24, 144, 255, 0.1); color: #1890ff; }
      &.hkstock { background: rgba(250, 84, 28, 0.1); color: #fa541c; }
      &.forex { background: rgba(250, 140, 22, 0.1); color: #fa8c16; }
    }

    .sym-code {
      font-size: 12px;
      color: #262626;
      font-family: monospace;
    }

    .sym-name {
      font-size: 11px;
      color: #8c8c8c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-grow: 1;
    }
  }

  .popover-popular-pane {
    .mkt-group-title {
      font-size: 11px;
      font-weight: 600;
      color: #8c8c8c;
      margin-bottom: 4px;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      ::v-deep .ant-tag {
        margin-right: 0;
        cursor: pointer;
        font-size: 11px;
        border-radius: 4px;
        &:hover {
          border-color: #1890ff;
          color: #1890ff;
          background: #f0f5ff;
        }
      }
    }
  }
}

/* Indicators Menu Styling */
.cell-indicator-menu {
  border-radius: 8px;
  .menu-indicator-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;

    .check-icon {
      color: #52c41a;
      font-size: 12px;
      width: 12px;
    }

    .check-placeholder {
      display: inline-block;
      width: 12px;
      height: 12px;
    }
  }
}

/* Mobile responsive scroll fallback */
@media (max-width: 900px) {
  .multi-column-monitor {
    .monitor-grid {
      grid-template-columns: 1fr !important;
      grid-template-rows: auto !important;
      height: auto;
      overflow-y: visible;

      .grid-cell-card {
        height: 380px !important;
      }
    }
    
    .monitor-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .toolbar-right {
        flex-wrap: wrap;
        justify-content: flex-start;
      }
    }
  }
}
</style>

<style lang="less">
/* Dark mode overrides for the symbol picker popover */
body.dark, body.realdark {
  .dark-popover {
    .ant-popover-inner {
      background-color: #1c1c1c !important;
      border: 1px solid #2a2a2a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    .ant-popover-inner-content {
      color: rgba(255, 255, 255, 0.85);
    }
    .ant-popover-arrow {
      border-right-color: #1c1c1c !important;
      border-bottom-color: #1c1c1c !important;
      background-color: #1c1c1c !important;
    }
    
    .symbol-picker-popover-content {
      .ant-tabs-nav .ant-tabs-tab {
        color: #8c8c8c;
        &:hover {
          color: #ffffff;
        }
      }
      .ant-tabs-nav .ant-tabs-tab-active {
        color: #1890ff;
      }
      .ant-tabs-bar {
        border-bottom-color: #2a2a2a;
      }
      .popover-item {
        &:hover {
          background-color: #252525;
        }
        .sym-code {
          color: #e8e8e8;
        }
        .sym-name {
          color: #7f7f7f;
        }
      }
      .popover-popular-pane .tags-row .ant-tag {
        background-color: #252525;
        border-color: #3a3a3a;
        color: #8c8c8c;
        &:hover {
          border-color: #1890ff;
          color: #1890ff;
          background: rgba(24, 144, 255, 0.1);
        }
      }
    }
  }
  
  .cell-indicator-menu {
    background-color: #1c1c1c !important;
    border-color: #2a2a2a;
    .ant-dropdown-menu-item {
      color: rgba(255, 255, 255, 0.85) !important;
      &:hover {
        background-color: #252525 !important;
      }
    }
  }
}
</style>

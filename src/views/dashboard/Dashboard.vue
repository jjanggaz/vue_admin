<template>
  <div class="dashboard">
    <!-- 자동새로고침 스위치 -->
    <div class="auto-refresh-section">
      <div class="auto-refresh-label">
        <span class="auto-refresh-text">자동 새로고침</span>
        <button
          type="button"
          @click="toggleAutoRefresh"
          :class="['toggle-switch', { active: autoRefreshEnabled }]"
          :aria-label="
            autoRefreshEnabled ? '자동새로고침 비활성화' : '자동새로고침 활성화'
          "
        >
          <span class="toggle-slider"></span>
        </button>
      </div>
    </div>

    <!-- 통계 요약 카드들 -->
    <div class="stats-grid">
      <StatsSummaryCard
        title="전체 프로젝트"
        :value="
          dashboardStore.dashboardData?.data?.projectStats?.total?.toString() ||
          '0'
        "
        change-value=""
        change-type="neutral"
        icon="fas fa-folder"
      />
      <StatsSummaryCard
        title="진행중 프로젝트"
        :value="
          dashboardStore.dashboardData?.data?.projectStats?.inProgress?.toString() ||
          '0'
        "
        change-value=""
        change-type="neutral"
        icon="fas fa-clock"
      />
      <StatsSummaryCard
        title="승인 대기"
        :value="
          dashboardStore.dashboardData?.data?.approvalStats?.pending?.toString() ||
          '0'
        "
        change-value=""
        change-type="neutral"
        icon="fas fa-clock"
      />
      <StatsSummaryCard
        title="승인 완료"
        :value="
          dashboardStore.dashboardData?.data?.approvalStats?.approved?.toString() ||
          '0'
        "
        change-value=""
        change-type="neutral"
        icon="fas fa-check-circle"
      />
    </div>

    <!-- 차트 그리드 -->
    <div class="charts-grid">
      <!-- 프로젝트 진행 현황 -->
      <div class="chart-item large">
        <ProjectStatusChart />
        <div class="chart-separator"></div>
        <ApprovalStatusChart />
      </div>

      <!-- 서버 상태 -->
      <div class="chart-item medium">
        <ServerStatusCard :server-status="dashboardStore.serverStatus" />
      </div>

      <!-- 3D모델 제작 현황 -->
      <div class="chart-item medium">
        <CategoryChart
          title="3D모델 제작 현황"
          total-label="전체"
          :categories="[
            {
              name: '1차처리',
              key: 'firstProcessing',
              count: 15,
              color: '#3b82f6',
            },
            {
              name: '주처리',
              key: 'mainProcessing',
              count: 45,
              color: '#10b981',
            },
            { name: '저류조', key: 'reservoir', count: 12, color: '#f59e0b' },
            { name: '기타', key: 'others', count: 8, color: '#ef4444' },
          ]"
        />
      </div>

      <!-- 공정관리 현황 -->
      <div class="chart-item medium">
        <CategoryChart
          title="공정관리 현황"
          total-label="전체"
          :categories="[
            { name: '진행중', key: 'active', count: 25, color: '#10b981' },
            { name: '대기중', key: 'pending', count: 15, color: '#f59e0b' },
            { name: '완료', key: 'completed', count: 30, color: '#3b82f6' },
            { name: '중단', key: 'suspended', count: 10, color: '#6b7280' },
          ]"
        />
      </div>

      <!-- 단가현황 -->
      <div class="chart-item medium">
        <CategoryChart
          title="단가현황"
          total-label="전체"
          :categories="[
            { name: '인건비', key: 'labor', count: 45, color: '#ef4444' },
            { name: '재료비', key: 'material', count: 30, color: '#8b5cf6' },
            { name: '설비비', key: 'equipment', count: 15, color: '#f59e0b' },
            { name: '간접비', key: 'overhead', count: 10, color: '#06b6d4' },
          ]"
        />
      </div>
    </div>

    <!-- 활동 및 알림 섹션 -->
    <div class="activity-section">
      <div class="activity-grid">
        <!-- 최근 활동 -->
        <div class="activity-card">
          <div class="card-header">
            <h3>최근 활동</h3>
            <a href="#" class="view-all">전체보기</a>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon document">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">신규 프로젝트 등록</div>
                <div class="activity-desc">
                  혁신치료 시스템 구축 프로젝트가 등록되었습니다.
                </div>
                <div class="activity-time">10분 전</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon success">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">프로젝트 완료</div>
                <div class="activity-desc">
                  AI 모델 학습 프로젝트가 성공적으로 완료되었습니다.
                </div>
                <div class="activity-time">1시간 전</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 주요 알림 -->
        <div class="activity-card">
          <div class="card-header">
            <h3>주요 알림</h3>
            <a href="#" class="view-all">전체보기</a>
          </div>
          <div class="activity-list">
            <div class="activity-item urgent">
              <div class="activity-icon urgent">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">긴급: 시스템 점검 예정</div>
                <div class="activity-desc">2025-06-17 02:00 - 04:00 (KST)</div>
                <div class="activity-time">시스템 점검</div>
              </div>
            </div>
            <div class="activity-item warning">
              <div class="activity-icon warning">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">저장공간 부족 경고</div>
                <div class="activity-desc">
                  서버 저장공간이 85% 이상 사용되었습니다.
                </div>
                <div class="activity-time">관리자 확인 필요</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import StatsSummaryCard from "@/components/dashboard/StatsSummaryCard.vue";
import ProjectStatusChart from "@/components/dashboard/ProjectStatusChart.vue";
import ApprovalStatusChart from "@/components/dashboard/ApprovalStatusChart.vue";
import ServerStatusCard from "@/components/dashboard/ServerStatusCard.vue";
import CategoryChart from "@/components/dashboard/CategoryChart.vue";

const dashboardStore = useDashboardStore();

// 자동새로고침 관련 상태
const autoRefreshEnabled = ref(false);
let autoRefreshInterval: number | null = null;

// 자동새로고침 토글
const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value;

  if (autoRefreshEnabled.value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

// 자동새로고침 시작
const startAutoRefresh = () => {
  stopAutoRefresh(); // 기존 타이머 정리
  autoRefreshInterval = setInterval(async () => {
    await dashboardStore.fetchDashboardData();
  }, 5000); // 5초마다
};

// 자동새로고침 중지
const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
};

onMounted(async () => {
  // 대시보드 진입 시 한 번만 새로고침
  const hasReloaded = sessionStorage.getItem("dashboardReloaded");
  if (!hasReloaded) {
    sessionStorage.setItem("dashboardReloaded", "true");
    window.location.reload();
    return;
  }

  await dashboardStore.fetchDashboardData();
});

// 컴포넌트 언마운트 시 자동새로고침 중지
onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped lang="scss">
.dashboard {
  padding: $spacing-lg;
  background-color: #f9fafb;
  min-height: 100vh;

  .auto-refresh-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: $spacing-lg;

    .auto-refresh-control {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      background-color: #e0e7ff;
      border-radius: 8px;
      padding: $spacing-sm $spacing-md;
      border: 1px solid #d1d5db;
    }

    .auto-refresh-label {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
    }

    .toggle-switch {
      position: relative;
      width: 48px;
      height: 24px;
      background-color: #d1d5db;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      padding: 0;

      &.active {
        background-color: #3b82f6;
      }

      .toggle-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &.active .toggle-slider {
        transform: translateX(24px);
      }

      &:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    }

    .auto-refresh-status {
      background-color: #f3f4f6;
      border-radius: 6px;
      padding: $spacing-sm $spacing-md;
      color: #4b5563;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: $spacing-md;
    margin-bottom: 20px;

    .chart-item {
      &.large {
        grid-column: span 2;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

      &.medium {
        grid-column: span 1;
        min-height: 400px;
      }
    }

    .chart-separator {
      height: 10px;
      margin: 13px 0;
    }
  }

  .activity-section {
    margin-top: 0;

    .activity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: $spacing-lg;
    }
  }
}

// 공통 카드 스타일
.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.activity-card {
  @extend .dashboard-card;
  padding: $spacing-lg;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    h3 {
      margin: 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
    }

    .view-all {
      color: #3b82f6;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    .activity-item {
      display: flex;
      gap: $spacing-md;
      padding: $spacing-md;
      border-radius: 8px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f9fafb;
      }

      &.urgent {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
      }

      &.warning {
        background-color: #fffbeb;
        border-left: 4px solid #f59e0b;
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        flex-shrink: 0;

        &.document {
          background-color: #3b82f6;
        }

        &.success {
          background-color: #10b981;
        }

        &.urgent {
          background-color: #ef4444;
        }

        &.warning {
          background-color: #f59e0b;
        }
      }

      .activity-content {
        flex: 1;

        .activity-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .activity-desc {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .activity-time {
          color: #9ca3af;
          font-size: 12px;
        }
      }
    }
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .dashboard {
    padding: $spacing-md;

    .auto-refresh-section {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-sm;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .charts-grid {
      grid-template-columns: 1fr;

      .chart-item.large {
        grid-column: span 1;
      }
    }

    .activity-section .activity-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>

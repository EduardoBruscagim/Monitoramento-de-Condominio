/**
 * ============================================================================
 * SKELETON FACTORY
 * Componentes reutilizáveis para estados de carregamento (Skeleton UI)
 * ============================================================================
 */
export const SkeletonFactory = {
  row(columns) {
    const cells = columns
      .map(
        (width) =>
          `<td><div class="skeleton skeleton-text" style="width:${width}"></div></td>`
      )
      .join("");
    return `<tr>${cells}</tr>`;
  },

  table(columns, rowCount = 5) {
    return Array(rowCount)
      .fill(0)
      .map(() => this.row(columns))
      .join("");
  },

  activityItem() {
    return `
      <div class="activity-item">
        <div class="skeleton skeleton-avatar" style="width:52px;height:52px;border-radius:16px;"></div>
        <div class="activity-info" style="flex:1">
          <div class="skeleton skeleton-text" style="width:50%"></div>
          <div class="skeleton skeleton-text" style="width:30%"></div>
        </div>
        <div class="skeleton skeleton-text" style="width:60px;height:24px;border-radius:20px;"></div>
      </div>`;
  },

  notificationItem() {
    return `
      <div class="notif-item">
        <div class="skeleton skeleton-avatar" style="border-radius:12px;"></div>
        <div class="notif-content">
          <div class="skeleton skeleton-text" style="width:70%"></div>
          <div class="skeleton skeleton-text" style="width:40%"></div>
        </div>
      </div>`;
  },

  moradorRow() {
    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="skeleton skeleton-avatar"></div>
            <div>
              <div class="skeleton skeleton-text" style="width:100px"></div>
              <div class="skeleton skeleton-text" style="width:60px"></div>
            </div>
          </div>
        </td>
        <td><div class="skeleton skeleton-text" style="width:50px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:120px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:80px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:30px"></div></td>
      </tr>`;
  },
};

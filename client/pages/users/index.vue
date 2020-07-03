<template>
  <section class="section">
    <section>
      <b-field grouped group-multiline>
        <b-field label="所属地域">
          <b-select v-model="area" placeholder="Select">
            <option
              v-for="area in areaOptions"
              :key="area.key"
              :value="area.key"
            >
              {{ area.value }}
            </option>
          </b-select>
        </b-field>
        <b-field label="登録名(部分一致)">
          <b-input v-model="name" />
        </b-field>
        <b-field label="DDR CODE">
          <b-input
            v-model.number="code"
            placeholder="10000000"
            minlength="8"
            maxlength="8"
            pattern="^\d{8}$"
          />
        </b-field>
      </b-field>
      <b-field>
        <b-button type="is-success" @click="search()">
          検索
        </b-button>
      </b-field>
    </section>

    <section>
      <b-table
        :data="users"
        striped
        :loading="loading"
        :mobile-cards="false"
        :total="totalCount"
        paginated
        backend-pagination
        per-page="50"
        @page-change="onPageChange"
      >
        <template slot-scope="props">
          <b-table-column field="name" label="Name">
            <nuxt-link :to="`/users/${props.row.id}`">
              {{ props.row.name }}
            </nuxt-link>
          </b-table-column>
          <b-table-column field="area" label="Area">
            {{ getAreaName(props.row.area) }}
          </b-table-column>
        </template>

        <template slot="empty">
          <section v-if="loading" class="section">
            <b-skeleton animated />
            <b-skeleton animated />
            <b-skeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>Nothing here.</p>
            </div>
          </section>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { AreaCode, areaList, User } from '~/types/api/user'

type UserListResponse = {
  next: string | null
  result: User[]
}

@Component
export default class UserListPage extends Vue {
  name: string = ''
  area: AreaCode = 0
  code: number | null = null
  users: User[] = []

  loading = false
  nextUrl: string | null = null

  /** AreaCode - String mapping for <select> components */
  readonly areaOptions = Object.entries(areaList).map(v => ({
    key: v[0],
    value: v[1],
  }))

  get totalCount() {
    return this.nextUrl ? this.users.length + 1 : this.users.length
  }

  getAreaName(areaCode: AreaCode) {
    return areaList[areaCode]
  }

  async onPageChange() {
    await this.loadMoreData()
  }

  /** Load user info */
  async search() {
    this.loading = true
    try {
      const searchParams = new URLSearchParams()
      if (this.name) searchParams.append('name', this.name)
      if (this.area) searchParams.append('area', `${this.area}`)
      if (this.code) searchParams.append('code', `${this.code}`)
      const { result, next } = await this.$http.$get<UserListResponse>(
        '/api/v1/users',
        { searchParams }
      )
      this.users = result
      this.nextUrl = next
    } catch (error) {
      this.$buefy.notification.open({
        message: error.message ?? error,
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    }
    this.loading = false
  }

  async loadMoreData() {
    if (!this.nextUrl) return
    try {
      const { result, next } = await this.$http.$get<UserListResponse>(
        this.nextUrl
      )
      this.users.push(...result)
      this.nextUrl = next
    } catch (error) {
      this.$buefy.notification.open({
        message: error.message ?? error,
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    }
  }
}
</script>
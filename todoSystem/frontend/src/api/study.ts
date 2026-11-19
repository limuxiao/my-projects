import { request } from '@/request'
import type {
  StudyDay,
  StudyFilm,
  StudyOverview,
  StudyProgress,
  StudyUnit,
} from '@/types/study'

// 课程数据只读公开；进度相关接口需登录，token 由 request 层统一注入
export function getStudyOverview() {
  return request<StudyOverview>({ method: 'GET', url: '/study/overview' })
}

export function getStudyUnits() {
  return request<StudyUnit[]>({ method: 'GET', url: '/study/units' })
}

export function getStudyDay(globalDay: number) {
  return request<StudyDay>({ method: 'GET', url: `/study/days/${globalDay}` })
}

export function searchStudyDays(q: string) {
  return request<StudyDay[]>({ method: 'GET', url: '/study/days/search', params: { q } })
}

export function getStudyFilms() {
  return request<StudyFilm[]>({ method: 'GET', url: '/study/films' })
}

export function getStudyProgress() {
  return request<StudyProgress>({ method: 'GET', url: '/study/progress' })
}

export function markStudyDayDone(globalDay: number) {
  return request<{ globalDay: number }>({ method: 'POST', url: `/study/progress/${globalDay}` })
}

export function unmarkStudyDayDone(globalDay: number) {
  return request<{ deleted: boolean }>({ method: 'DELETE', url: `/study/progress/${globalDay}` })
}

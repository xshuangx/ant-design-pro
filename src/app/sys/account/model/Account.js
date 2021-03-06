import modelExtend from 'dva-model-extend';
import {
  listUser,
  delUser,
  lockUser,
  saveUser,
  getUser,
  checkUnique,
} from '../service/AccountService';
import { listOrgByAttr } from '../../organization/service/Organization';
import { pageModel } from 'core/common/BaseModel';
import { message } from 'antd';

export default modelExtend(pageModel, {
  namespace: 'account',
  state: {
    orgData: [],
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 校验编码唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 右侧按条件查询
    *fetchUser({ payload }, { call, put }) {
      const response = yield call(listUser, payload);
      yield put({
        type: 'updateState',
        payload: {
          data: {
            list: response.data.data,
            pagination: {
              total: response.data.total,
              current: response.data.current,
            },
          },
        },
      });
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: 'edit',
            currentItem: response.data,
          },
        });
      }
    },
    // 保存提交
    *save({ payload }, { call, put }) {
      const response = yield call(saveUser, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
            data: {
              list: response.data.data,
              pagination: {
                total: response.data.total,
                current: response.data.current,
              },
            },
          },
        });
        message.success('操作成功');
      } else {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
          },
        });
        message.success('操作失败');
      }
    },
    // 查询
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const userData = yield call(listUser, payload);
      const treeData = yield call(listOrgByAttr, { status: '0001' });
      yield put({
        type: 'updateState',
        payload: {
          data: {
            list: userData.data.data,
            pagination: {
              total: userData.data.total,
              current: userData.data.current,
            },
          },
          orgData: treeData.data,
        },
      });
    },
    // 切换锁定状态
    *lockSwitch({ payload }, { call, put }) {
      const response = yield call(lockUser, payload);
      if (response && response.success) {
      }
    },
    // 删除
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(delUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              list: response.data.data,
              pagination: {
                total: response.data.total,
                current: response.data.current,
              },
            },
            selectedRowKeys: [],
          },
        });
      }
      if (callback) callback();
    },
  },
});

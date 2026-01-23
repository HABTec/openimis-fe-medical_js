import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { withStyles, withTheme } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";

import {
  coreConfirm,
  ErrorBoundary,
  Form,
  Helmet,
  formatMessageWithValues,
  historyPush,
  journalize,
  parseData,
  ProgressOrError,
  withHistory,
  withModulesManager,
} from "@openimis/fe-core";

import {
  createMedicalLabService,
  fetchMedicalLabService,
  fetchMedicalLabServiceMutation,
  newMedicalLabService,
  clearLabServiceForm,
} from "../actions";
import {
  RIGHT_MEDICALLABSERVICES,
  RIGHT_MEDICALLABSERVICES_ADD,
  RIGHT_MEDICALLABSERVICES_EDIT,
} from "../constants";
import MedicalLabServiceMasterPanel from "./MedicalLabServiceMasterPanel";
import { validateCategories } from "../utils";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

const MEDICAL_LAB_SERVICE_OVERVIEW_MUTATIONS_KEY = "medicalLabService.MedicalLabServiceOverview.mutations";

class MedicalLabServiceForm extends Component {
  state = {
    reset: 0,
    medicalLabService: this.newMedicalLabService(),
    newMedicalLabService: true,
    confirmedAction: null,
    isSaved: false,
  };

  newMedicalLabService() {
    return { patientCategory: 15 };
  }

  componentDidMount() {
    if (this.props.medicalLabServiceId) {
      this.setState(
        (state, props) => ({ medicalLabServiceId: props.medicalLabServiceId }),
        () => this.props.fetchMedicalLabService(this.props.modulesManager, this.props.medicalLabServiceId),
      );
    }
    if (this.props.id) {
      this.setState((state, props) => ({
        medicalLabService: {
          ...this.newMedicalLabService(),
          id: props.id,
        },
      }));
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.fetchedMedicalLabService && !!this.props.fetchedMedicalLabService) {
      const { medicalLabService } = this.props;
      this.setState({
        medicalLabService,
        medicalLabServiceId: medicalLabService.id,
        lockNew: false,
        newMedicalLabService: false,
      });
    } else if (prevProps.medicalLabServiceId && !this.props.medicalLabServiceId) {
      this.setState({
        medicalLabService: this.newMedicalLabService(),
        newMedicalLabService: true,
        lockNew: false,
        medicalLabServiceId: null,
      });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state, props) => ({
        medicalLabService: {
          ...state.medicalLabService,
          clientMutationId: props.mutation.clientMutationId,
        },
      }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  componentWillUnmount = () => {
    this.props.clearLabServiceForm();
  };

  add = () => {
    this.setState(
      (state) => ({
        medicalLabService: this.newMedicalLabService(),
        newMedicalLabService: true,
        lockNew: false,
        reset: state.reset + 1,
      }),
      () => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  reload = async () => {
    const { modulesManager, history, mutation, fetchMedicalLabServiceMutation, medicalLabServiceId, fetchMedicalLabService } =
      this.props;
    const { isSaved } = this.state;

    if (medicalLabServiceId) {
      try {
        await fetchMedicalLabService(modulesManager, medicalLabServiceId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[RELOAD_MEDICAL_LAB_SERVICE]: Fetching laboratory service details failed. ${error}`);
      }
      return;
    }

    if (isSaved) {
      try {
        const { clientMutationId } = mutation;
        const response = await fetchMedicalLabServiceMutation(modulesManager, clientMutationId);
        const createdUuid = parseData(response.payload.data.medicalLabServices)[0].uuid;
        historyPush(modulesManager, history, "medical.medicalLabServiceOverview", [createdUuid]);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[RELOAD_MEDICAL_LAB_SERVICE]: Error fetching medical lab service mutation: ${error}`);
      }
    }

    this.setState({
      reset: 0,
      medicalLabService: this.newMedicalLabService(),
      newMedicalLabService: true,
      confirmedAction: null,
    });
  };

  canSave = () => {
    const { medicalLabService } = this.state;
    return (
      !!medicalLabService?.code &&
      !!medicalLabService?.name &&
      medicalLabService?.price &&
      !isNaN(medicalLabService?.price) &&
      medicalLabService?.careType &&
      validateCategories(medicalLabService?.patientCategory)
    );
  };

  save = () => {
    const medicalLabService = this.state.medicalLabService;
    this.setState({ isSaved: true });
    this.props.save(medicalLabService);
  };

  back = () => {
    this.props.back();
  };

  onEditedChanged = (medicalLabService) => {
    this.setState({ medicalLabService });
  };

  onReset = () => {
    if (this.state.medicalLabServiceId) {
      this.reload();
    } else {
      this.setState({ medicalLabService: this.newMedicalLabService(), reset: this.state.reset + 1 });
    }
  };

  render() {
    const {
      classes,
      modulesManager,
      intl,
      readOnly,
      actions,
      confirmed,
      confirm,
      confirming,
      errorMedicalLabService,
      rights,
    } = this.props;
    const { medicalLabService } = this.state;
    const canAccess =
      rights.includes(RIGHT_MEDICALLABSERVICES) ||
      rights.includes(RIGHT_MEDICALLABSERVICES_EDIT) ||
      rights.includes(RIGHT_MEDICALLABSERVICES_ADD);

    if (!canAccess) return null;

    return (
      <div className={!!medicalLabService?.clientMutationId ? classes.lockedPage : null}>
        <Helmet title={formatMessageWithValues(intl, "medical.labService", "labServiceTitle")} />
        <ErrorBoundary>
          <ProgressOrError progress={this.props.fetchingMedicalLabService} error={errorMedicalLabService} />
          <Form
            module="medicalLabService"
            title={medicalLabService?.uuid ? "medical.labService.MedicalLabServiceOverview.title" : "medical.labService.MedicalLabServiceOverview.newTitle"}
            edited={medicalLabService}
            edited_id={medicalLabService?.uuid}
            readOnly={readOnly}
            HeadPanel={MedicalLabServiceMasterPanel}
            Panels={[]}
            save={readOnly ? null : this.save}
            back={this.back}
            canSave={this.canSave}
            onEditedChanged={this.onEditedChanged}
            openDirty={this.save}
            actions={actions ?? []}
            confirmed={confirmed}
            confirm={confirm}
            confirming={confirming}
          />
        </ErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingMedicalLabService: state.medical.fetchingMedicalLabService,
  fetchedMedicalLabService: state.medical.fetchedMedicalLabService,
  medicalLabService: state.medical.medicalLabService,
  errorMedicalLabService: state.medical.errorMedicalLabService,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
  confirming: state.core.confirming,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMedicalLabService,
      newMedicalLabService,
      fetchMedicalLabServiceMutation,
      journalize,
      coreConfirm,
      clearLabServiceForm,
    },
    dispatch,
  );

export default injectIntl(
  withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(MedicalLabServiceForm)))),
  ),
);

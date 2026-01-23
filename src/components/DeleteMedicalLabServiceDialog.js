import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";

import { FormattedMessage } from "@openimis/fe-core";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

class DeleteMedicalLabServiceDialog extends Component {
  render() {
    const { classes, medicalLabService, onCancel, onConfirm } = this.props;
    return (
      <Dialog open={!!medicalLabService} onClose={onCancel}>
        <DialogTitle>
          <FormattedMessage module="medical" id="medical.labService.deleteDialog.title" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage module="medical" id="medical.labService.deleteDialog.message" />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onConfirm()} className={classes.primaryButton} autoFocus>
            <FormattedMessage module="medical" id="medical.labService.deleteDialog.yes.button" />
          </Button>
          <Button onClick={onCancel} className={classes.secondaryButton}>
            <FormattedMessage module="core" id="cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withTheme(withStyles(styles)(DeleteMedicalLabServiceDialog));

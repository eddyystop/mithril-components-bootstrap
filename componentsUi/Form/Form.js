/*global m:false */
// Form ========================================================================
mc.Form = {
  Controller: function () { },

  // options: <props> labelCols, controlCols, heightSize, horizontalSize, controls[]
  view: function (ctrl, options) {
    return m('form.form-horizontal[role=form]',
      (options.controls || []).map(function (control) {
        /*
        if (control.mprop) { console.log(control.tag, control.mprop()) }
        if (control.set) {
          control.set.map(function (set) {
            if (set.mprop) { console.log(control.tag, set.mprop()) }
          })
        }
        */
        if (!control) { return null; }
        return m('.form-group' + (control.horizontalSize || options.horizontalSize || '.form-group-sm'),
          renderControl(control,
              control.labelCols || options.labelCols || '.col-sm-2',
              control.controlCols || options.controlCols || '.col-sm-6',
              control.heightSize || options.heightSize || '.input-sm')
        )
      })
    );

    // options.tab[]: <props> name, label, isActive, labelCols, controlCols, heightSize
    function renderControl (control, labelCols, controlCols, heightSize) {
      switch (control.tag) {

        // options: <props> tag, type, label, mprop, placeholder, value, autofocus, readonly, disabled, cols
        case 'input':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('input.form-control' +  heightSize,
                mc.utils.extend(control.readonly ? { readonly: true } : {}, {
                  type: control.type || 'text',
                  placeholder: control.placeholder || '',
                  value: control.mprop() || '',
                  autofocus: control.autofocus || false,
                  disabled: control.disabled || false,
                  onchange: m.withAttr('value', control.mprop)
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, set[{ label, mprop, autofocus, disabled }]
        case 'checkbox':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('.checkbox',
                (control.set || []).map(function (set) {

                  return m('label.checkbox-inline', [
                    m('input[type=checkbox]', {
                      checked: set.mprop(),
                      autofocus: control.autofocus || false,
                      disabled: set.disabled || false,
                      onchange: m.withAttr('checked', set.mprop)
                    }),
                    m('span', ' ' + set.label)
                  ])
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, mprop, name, set[{ label, value, autofocus, disabled }]
        case 'radio':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('.radio',
                (control.set || []).map(function (set) {

                  return m('label.radio-inline', [
                    m('input[type=radio]', {
                      name: control.name || 'radio-set',
                      value: set.value,
                      checked: control.mprop() === set.value,
                      autofocus: set.autofocus || false,
                      disabled: set.disabled || false,
                      onchange: function (mprop, e) { mprop(set.value); }.bind({}, control.mprop)
                    }),
                    m('span', ' ' + set.label || set.value)
                  ])
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, mprop, name, cols, set[{ label, value, autofocus, disabled }]
        case 'textarea':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('textarea.form-control' +  heightSize, {
                rows: control.rows || 1,
                autofocus: control.autofocus || false,
                disabled: control.disabled || false
              }, control.text || '')
            )
          ];
          break;

        // options: <props> tag, label, mprop, autofocus, cols, options[{ label, value, selected, disabled }]
        case 'select': // not multiple
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('select.form-control' +  heightSize, {
                  autofocus: control.autofocus || false,
                  onchange: function(mprop, e) { mprop(e.target.options[e.target.selectedIndex].value); }.bind({}, control.mprop)
                },
                (control.options || []).map(function (option) {

                  return m('option', {
                    value: option.value,
                    selected: control.mprop() === option.value,
                    disabled: option.disabled || false
                  }, option.label || option.value)
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, text }]
        case 'static':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('p.form-control-static' + heightSize, control.text)
            )
          ];
          break;

        // options: <props> tag, size, text, small }]
        case 'heading':
          return [
            m((control.size || 'h1') + labelCols, [
              control.text,
              control.small ? m('small', ' ' + control.small) : ''
            ])
          ];
          break;
      }
    }
  }
};

.. default-domain:: js

.. data:: current_filter
     
     current pattern used in the last :function:`filter_result`


     

.. function:: filter_result
     
     :arg filter: regex used as filter for the main content, if not passed, ``#addsearch_form``\ 's ``input`` is used
         if `filter` starts with "type:", the the search is done against ``mime``` item's data, else ``searchable`` is used.
     :type filter: str

     Filter the ``.item``\s on display


.. class:: ui

    Main UI object, used for navigation logic and state

.. function:: ui.select_idx

     changes selection from old_idx to new_idx
    if new_idx == -1, then selects the last item

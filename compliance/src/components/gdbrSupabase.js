import Supabase from '../SupabaseClient.js';

export const gdprSupabaseService = {
  // ============================================================
  // BASIC DATA FETCHING
  // ============================================================

  // Get all standards
  async getAllStandards() {
    try {
      const { data, error } = await Supabase
        .from('standards')
        .select('*')
        .order('code', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching standards:', error);
      throw error;
    }
  },

  // Get GDPR standard specifically
  async getGDPRStandard() {
    try {
      const { data, error } = await Supabase
        .from('standards')
        .select('*')
        .eq('code', 'GDPR')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching GDPR standard:', error);
      throw error;
    }
  },

  // ============================================================
  // HIERARCHICAL DATA FETCHING
  // ============================================================

  // Get GDPR with all controls (without subcontrols)
  async getGDPRWithControls() {
    try {
      const { data, error } = await Supabase
        .from('standards')
        .select(`
          id,
          code,
          title,
          created_at,
          controls (
            id,
            code,
            definition
          )
        `)
        .eq('code', 'GDPR')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching GDPR with controls:', error);
      throw error;
    }
  },

  // Get specific control with subcontrols
  async getControlWithSubcontrols(controlId) {
    try {
      const { data, error } = await Supabase
        .from('controls')
        .select(`
          id,
          code,
          definition,
          subcontrols (
            id,
            code
          )
        `)
        .eq('id', controlId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching control with subcontrols:', error);
      throw error;
    }
  },

  // Get subcontrol with activities
  async getSubcontrolWithActivities(subcontrolId) {
    try {
      const { data, error } = await Supabase
        .from('subcontrols')
        .select(`
          id,
          code,
          activities (
            id,
            description
          )
        `)
        .eq('id', subcontrolId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subcontrol with activities:', error);
      throw error;
    }
  },

  // ============================================================
  // COMPLETE GDPR STRUCTURE
  // ============================================================

  // Get complete GDPR structure (standards -> controls -> subcontrols -> activities)
  async getGDPRFullStructure() {
    try {
      const { data, error } = await Supabase
        .from('standards')
        .select(`
          id,
          code,
          title,
          created_at,
          controls (
            id,
            code,
            definition,
            subcontrols (
              id,
              code,
              activities (
                id,
                description
              )
            )
          )
        `)
        .eq('code', 'GDPR')
        .single();
      
      if (error) throw error;
      
      // Sort controls by code
      if (data?.controls) {
        data.controls.sort((a, b) => a.code.localeCompare(b.code));
        
        // Sort subcontrols by code within each control
        data.controls.forEach(control => {
          if (control.subcontrols) {
            control.subcontrols.sort((a, b) => a.code.localeCompare(b.code));
          }
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching full GDPR structure:', error);
      throw error;
    }
  },

  // ============================================================
  // ORGANIZATION & WORKING POLICIES
  // ============================================================

  // Get user's organizations
  async getUserOrganizations() {
    try {
      const { data, error } = await Supabase
        .from('my_orgs')
        .select(`
          org_id,
          organizations (
            id,
            name,
            created_at
          )
        `);
      
      if (error) throw error;
      return data?.map(item => item.organizations) || [];
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      throw error;
    }
  },

  // Get working policies for an organization
  async getWorkingPolicies(orgId) {
    try {
      const { data, error } = await Supabase
        .from('working_policies')
        .select(`
          org_id,
          subcontrol_id,
          ordinal,
          content,
          updated_by,
          updated_at,
          subcontrols (
            id,
            code,
            controls (
              id,
              code,
              definition
            )
          )
        `)
        .eq('org_id', orgId)
        .order('ordinal', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching working policies:', error);
      throw error;
    }
  },

  // Create or update working policy
  async upsertWorkingPolicy(orgId, subcontrolId, content, ordinal) {
    try {
      const { data: userData } = await Supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await Supabase
        .from('working_policies')
        .upsert({
          org_id: orgId,
          subcontrol_id: subcontrolId,
          ordinal: ordinal,
          content: content,
          updated_by: userData.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting working policy:', error);
      throw error;
    }
  },

  // Delete working policy
  async deleteWorkingPolicy(orgId, subcontrolId) {
    try {
      const { error } = await Supabase
        .from('working_policies')
        .delete()
        .eq('org_id', orgId)
        .eq('subcontrol_id', subcontrolId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting working policy:', error);
      throw error;
    }
  },

  // ============================================================
  // POLICY DOCUMENTS & VERSIONING
  // ============================================================

  // Get policy documents for an organization
  async getPolicyDocuments(orgId, standardId = null) {
    try {
      let query = Supabase
        .from('policy_documents')
        .select(`
          id,
          org_id,
          standard_id,
          title,
          version_no,
          status,
          created_by,
          created_at,
          standards (
            code,
            title
          )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (standardId) {
        query = query.eq('standard_id', standardId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching policy documents:', error);
      throw error;
    }
  },

  // Get latest published document for GDPR
  async getLatestGDPRDocument(orgId) {
    try {
      const { data, error } = await Supabase
        .from('latest_published_doc')
        .select(`
          document_id,
          org_id,
          standard_id,
          title,
          version_no,
          status,
          created_by,
          created_at
        `)
        .eq('org_id', orgId)
        .eq('standards.code', 'GDPR')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    } catch (error) {
      console.error('Error fetching latest GDPR document:', error);
      throw error;
    }
  },

  // Get document with items for export
  async getDocumentExport(documentId) {
    try {
      const { data, error } = await Supabase
        .from('document_export')
        .select('*')
        .eq('document_id', documentId)
        .order('ordinal', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching document export:', error);
      throw error;
    }
  },

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const { data: userData } = await Supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await Supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Check if user is member of organization
  async isUserMemberOfOrg(orgId) {
    try {
      const { data: userData } = await Supabase.auth.getUser();
      
      if (!userData?.user) {
        return false;
      }

      const { data, error } = await Supabase
        .from('org_members')
        .select('role')
        .eq('org_id', orgId)
        .eq('user_id', userData.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking organization membership:', error);
      return false;
    }
  },

  // ============================================================
  // STATISTICS & ANALYTICS
  // ============================================================

  // Get GDPR compliance statistics for an organization
  async getGDPRComplianceStats(orgId) {
    try {
      // Get total subcontrols
      const { data: totalSubcontrols, error: totalError } = await Supabase
        .from('subcontrols')
        .select('id', { count: 'exact', head: true })
        .eq('controls.standards.code', 'GDPR');

      if (totalError) throw totalError;

      // Get completed policies (with content)
      const { data: completedPolicies, error: completedError } = await Supabase
        .from('working_policies')
        .select('subcontrol_id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .neq('content', '');

      if (completedError) throw completedError;

      return {
        total: totalSubcontrols || 0,
        completed: completedPolicies || 0,
        percentage: totalSubcontrols ? Math.round((completedPolicies / totalSubcontrols) * 100) : 0
      };
    } catch (error) {
      console.error('Error fetching compliance stats:', error);
      throw error;
    }
  },

  // ============================================================
  // BULK OPERATIONS
  // ============================================================

  // Bulk update working policies
  async bulkUpdateWorkingPolicies(orgId, policies) {
    try {
      const { data: userData } = await Supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      const policiesToUpsert = policies.map((policy, index) => ({
        org_id: orgId,
        subcontrol_id: policy.subcontrolId,
        ordinal: index + 1,
        content: policy.content,
        updated_by: userData.user.id
      }));

      const { data, error } = await Supabase
        .from('working_policies')
        .upsert(policiesToUpsert)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error bulk updating working policies:', error);
      throw error;
    }
  }
};

export default gdprSupabaseService;